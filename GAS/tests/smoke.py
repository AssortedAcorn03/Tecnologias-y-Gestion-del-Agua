"""Prueba de integración. SOLO contra una base de pruebas; crea y desactiva un usuario.
Variables: GAS_TEST_URL, GAS_TEST_ADMIN, GAS_TEST_PASSWORD.
El administrador debe haber cambiado previamente su contraseña inicial.
"""
import http.cookiejar
import json
import os
import secrets
import urllib.error
import urllib.request

BASE = os.environ.get('GAS_TEST_URL', 'http://localhost:5298').rstrip('/')

def client():
    return urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))

def call(c, path, method='GET', data=None, expected=200):
    req = urllib.request.Request(BASE + path, method=method,
        data=None if data is None else json.dumps(data).encode(),
        headers={'Content-Type': 'application/json', 'X-GAS-Request': '1'})
    try:
        response = c.open(req, timeout=20)
    except urllib.error.HTTPError as error:
        response = error
    raw = response.read()
    assert response.code == expected, (method, path, response.code, raw.decode()[:250])
    return json.loads(raw) if raw else {}

def main():
    admin, other, anon = client(), client(), client()
    call(anon, '/api/usuarios', expected=401)
    call(admin, '/api/auth/login', 'POST', {'correo': os.environ['GAS_TEST_ADMIN'], 'password': os.environ['GAS_TEST_PASSWORD']})
    assert not call(admin, '/api/auth/me')['requiereCambio'], 'Cambia primero la contraseña del administrador.'
    roles = call(admin, '/api/roles')
    student = next(r['id'] for r in roles if r['nombre'] == 'Alumno')
    suffix = secrets.token_hex(5)
    password, new_password = 'TestInicial' + suffix + '123', 'TestNueva' + suffix + '456'
    data = {'nombre': 'Prueba automatizada', 'correo': f'qa-{suffix}@example.com', 'claveInstitucional': 'QA' + suffix.upper(), 'rolId': student, 'activo': True, 'password': password}
    uid = call(admin, '/api/usuarios', 'POST', data, 201)['id']
    try:
        call(admin, '/api/usuarios', 'POST', dict(data, correo=data['correo'].upper()), 409)
        call(admin, '/api/usuarios', 'POST', dict(data, correo=f'otro-{suffix}@example.com'), 409)
        call(other, '/api/auth/login', 'POST', {'correo': data['correo'], 'password': password})
        call(other, '/api/usuarios', expected=403)
        call(other, '/api/auth/cambiar-password', 'POST', {'actual': password, 'nueva': new_password})
        call(other, '/api/auth/me', expected=401)
        call(other, '/api/auth/login', 'POST', {'correo': data['correo'], 'password': new_password})
        call(other, '/api/usuarios', expected=403)
        result = call(admin, '/api/usuarios?buscar=' + suffix)
        assert any(u['id'] == uid for u in result['usuarios'])
        call(admin, f'/api/usuarios/{uid}', 'PUT', dict(data, nombre='Nombre editado', password=None))
        call(other, '/api/auth/me', expected=401)
        assert call(admin, f'/api/usuarios/{uid}')['nombre'] == 'Nombre editado'
        for _ in range(5):
            call(other, '/api/auth/login', 'POST', {'correo': data['correo'], 'password': 'incorrecta123'}, 401)
        call(other, '/api/auth/login', 'POST', {'correo': data['correo'], 'password': new_password}, 401)
        assert call(admin, f'/api/usuarios/{uid}')['bloqueadoHasta'] is not None
        call(admin, f'/api/usuarios/{uid}', 'DELETE')
        assert call(admin, f'/api/usuarios/{uid}')['activo'] is False
        call(other, '/api/auth/login', 'POST', {'correo': data['correo'], 'password': new_password}, 401)
        call(admin, '/api/usuarios', 'POST', data, 409)
        call(admin, '/api/auth/logout', 'POST', expected=204)
        call(admin, '/api/auth/me', expected=401)
        print('PASS: permisos, alta, duplicados, cambio de contraseña, consulta, edición, revocación, bloqueo, baja y logout.')
    finally:
        # Se conserva el registro como evidencia; nunca se hace DELETE físico.
        cleanup = client()
        call(cleanup, '/api/auth/login', 'POST', {'correo': os.environ['GAS_TEST_ADMIN'], 'password': os.environ['GAS_TEST_PASSWORD']})
        call(cleanup, f'/api/usuarios/{uid}', 'DELETE')
        call(cleanup, '/api/auth/logout', 'POST', expected=204)

if __name__ == '__main__':
    main()
