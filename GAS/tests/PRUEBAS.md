# Verificación de la entrega

## Ejecutado en este entorno

- `dotnet build`: correcto, 0 errores. 16 advertencias CS8981 por nombres de modelos en minúscula heredados del proyecto.
- `node --check`: correcto en todos los archivos JavaScript del backend.
- Nueve comprobaciones .NET: longitudes de contraseña, requisito de números, hash correcto, contraseña incorrecta, hash inválido, tokens aleatorios, digest del token y generación del esquema EF con las entidades agregadas.
- Siete comprobaciones HTTP reales: login HTML 200; usuarios y roles sin sesión 401; mutación sin cabecera 400; logout con cabecera 204; login sin datos 400; recuperación sin SMTP 503.

No se ejecutaron las operaciones contra MySQL ni el envío SMTP: no había un servicio MySQL disponible ni credenciales de correo. La compilación y las pruebas anteriores no sustituyen esas comprobaciones. Tampoco se completó una prueba visual automatizada en navegador.

Para repetir las comprobaciones .NET, desde GAS:

```powershell
dotnet run --project tests/Checks/Checks.csproj
```

## Prueba de integración automatizada (pendiente de ejecutar con MySQL)

Usa una base exclusiva de pruebas con DB.sql, seed.sql y seguridad.sql aplicados y un administrador que ya haya cambiado su contraseña. Inicia el backend conectado a esa base.

```powershell
$env:GAS_TEST_URL = "http://localhost:5298"
$env:GAS_TEST_ADMIN = Read-Host "Correo del administrador de pruebas"
$clavePrueba = Read-Host "Contraseña" -AsSecureString
$env:GAS_TEST_PASSWORD = [System.Net.NetworkCredential]::new("", $clavePrueba).Password
try { python tests/smoke.py }
finally { Remove-Item Env:GAS_TEST_PASSWORD -ErrorAction SilentlyContinue }
```

Crea un usuario QA, comprueba duplicados, permisos, cambio obligatorio, edición, revocación, bloqueo y baja. Conserva el registro inactivo como evidencia. Si se repite de inmediato puede alcanzar el límite por IP: esperar un minuto. No ejecutarlo sobre datos reales.

## Casos manuales adicionales

| Caso | Resultado esperado |
|---|---|
| Cuenta inactiva con contraseña correcta | No permite acceso. |
| Cinco errores simultáneos sobre la misma cuenta | Contador serializado y bloqueo sin perder incrementos. |
| Contraseña correcta durante el bloqueo | Sigue rechazando. |
| Contraseña correcta después de 15 minutos | Accede y reinicia contador. |
| Crear/editar con correo de otro usuario | 409, tampoco permite duplicar cuentas inactivas. |
| Dos altas simultáneas con el mismo correo o clave | Solo una persiste; la otra devuelve conflicto. |
| Modificar rol de un usuario conectado | Su sesión previa deja de funcionar. |
| Alumno o profesor llama directamente a API de usuarios | 403. |
| Desactivar cuenta propia o último administrador | Rechazo sin cambios. |
| Cerrar sesión y volver a usar la cookie anterior | 401. |
| Dejar el navegador 15 minutos sin interacción | Vuelve al login; actividad/API no revive sesión vencida. |
| Reiniciar backend | Sesiones en MySQL siguen sujetas a expiración; cookie requiere conservar las claves de Data Protection. |
| Recuperación a correo activo | Llega enlace con caducidad de 30 minutos. |
| Recuperación a correo desconocido | Misma respuesta genérica, sin revelar existencia. |
| Reutilizar enlace canjeado o canjearlo simultáneamente | Solo un canje funciona. |
| Recuperación con enlace vencido o alterado | Rechazo sin modificar contraseña. |
| Cambiar contraseña por recuperación | Cierra todas las sesiones y elimina el bloqueo previo. |
| Desactivar cuenta después de solicitar recuperación | El enlace ya no funciona. |
| Nombre con etiquetas HTML | Se muestra como texto, no ejecuta código. |

Para comprobar expiración sin esperar, únicamente en una base de pruebas:

```sql
UPDATE sesion_usuario
SET UltimaActividad = UTC_TIMESTAMP() - INTERVAL 16 MINUTE
WHERE UsuarioId = ID_DEL_USUARIO_DE_PRUEBA;
```

Después consulta `/api/auth/me`: debe responder 401. No uses ese SQL en producción.
