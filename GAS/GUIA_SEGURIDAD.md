# Seguridad y administración de usuarios

## Qué se agregó

Esta entrega trabaja con la aplicación existente en `GAS/backend/wwwroot` y ASP.NET Core 10, usando MySQL. El proyecto adjunto corresponde a seguimiento de posgrado/egresados. El esqueleto de Next.js se conserva sin modificaciones; abre la interfaz desde el backend.

| Función solicitada | Comportamiento |
|---|---|
| Cuenta activa | Solo acceden usuarios activos con un rol activo. |
| Intentos fallidos | Cinco errores bloquean la cuenta por 15 minutos; después del bloqueo el contador vuelve a comenzar. |
| Recuperación | Enlace aleatorio por correo, válido 30 minutos, de un solo uso. La base guarda únicamente su hash. |
| Inactividad | Sesión validada en el servidor; expira a los 15 minutos sin actividad y, como máximo, a las 8 horas. |
| Alta y edición | Nombre asociado, correo, clave institucional opcional, rol y estado. Contraseña inicial con cambio obligatorio. |
| No duplicados | Correo y clave únicos, incluso entre usuarios inactivos. Comprobación de claves académicas existentes. |
| Baja lógica | Cambia el estado a inactivo, conserva la información y revoca sesiones y enlaces de recuperación. |
| Consulta | Búsqueda por ID, nombre, correo o clave, filtros por rol/estado y páginas de 25 resultados. |
| Roles | Administrador y Coordinador gestionan usuarios. Los demás roles solo acceden a su cuenta en este módulo. |
| Registro de acceso | Guarda usuario, fecha UTC, IP y resultado de los inicios de sesión. |

El SRS incluido numera estas funciones como RF-6.1 a RF-6.6 y RF-7.1 a RF-7.6. Los tiempos y el límite de intentos son decisiones de esta implementación, porque el documento no establece cantidades; se cambian en `backend/Auth/Seguridad.cs`. No se implementan aquí los otros módulos académicos ni usuarios externos temporales, que requieren reglas adicionales.

## 1. Preparar la base de datos

Haz un respaldo de tu base. En MySQL Workbench:

- Si **ya tienes** `seguimiento_posgrado`, ejecuta solamente `database/seguridad.sql` **una vez**.
- Si partes de una base vacía, ejecuta en orden: `database/DB.sql`, `database/seed.sql`, `database/seguridad.sql`.
- No vuelvas a ejecutar DB.sql sobre tus datos existentes.

La actualización agrega `nombre` y `clave_institucional` a usuario, y crea `sesion_usuario`. Los usuarios existentes conservan sus datos; sus nombres/claves nuevos pueden completarse en el panel. La clave opcional admite letras, números, guion y guion bajo. No registra automáticamente alumnos ni profesores: son operaciones de los módulos académicos.

## 2. Configurar la conexión

En PowerShell abre la carpeta que contiene `backend.csproj`:

```powershell
cd "RUTA_DE_TU_PROYECTO\GAS\backend"
dotnet user-secrets set "ConnectionStrings:GasDb" "Server=localhost;Port=3306;Database=seguimiento_posgrado;User=TU_USUARIO;Password=TU_PASSWORD;"
dotnet restore
dotnet build
```

Necesitas SDK .NET 10 y MySQL 8. No guardes la contraseña de MySQL en el repositorio.

## 3. Crear el primer administrador

Este comando local solo funciona cuando no hay ningún administrador activo. No hay contraseña predeterminada ni endpoint público de alta de administrador.

```powershell
$env:GAS_ADMIN_CORREO = Read-Host "Correo del administrador"
$claveSegura = Read-Host "Contraseña inicial (mínimo 12 caracteres, letras y números)" -AsSecureString
$env:GAS_ADMIN_PASSWORD = [System.Net.NetworkCredential]::new("", $claveSegura).Password
try { dotnet run -- --crear-admin }
finally { Remove-Item Env:GAS_ADMIN_PASSWORD -ErrorAction SilentlyContinue }
Remove-Item Env:GAS_ADMIN_CORREO -ErrorAction SilentlyContinue
```

Si ya existe un administrador, usa su cuenta o recuperación. Contraseñas antiguas en texto plano o hashes de otro sistema no se aceptan; restablécelas mediante recuperación. Los nuevos hashes se generan con PasswordHasher de ASP.NET Core Identity.

## 4. Iniciar y utilizar la aplicación

```powershell
dotnet run --launch-profile http
```

Abre **http://localhost:5298/login.html**. No abras el HTML directamente desde el explorador de archivos.

1. Inicia sesión con el administrador.
2. Cambia la contraseña inicial y vuelve a iniciar sesión.
3. En el panel aparece la lista de usuarios y el botón **Nuevo usuario**.
4. Captura nombre, correo, clave si corresponde, rol, estado y contraseña inicial.
5. Usa **Editar / rol** para modificar los datos, asignar rol o reactivar.
6. Usa **Dar de baja** para desactivar sin eliminar.
7. **Mi cuenta** permite cambiar contraseña y cerrar sesión.

No puedes desactivar tu propia cuenta ni modificar tu propio rol. Tampoco puedes quitar al último administrador activo. Editar un usuario revoca sus sesiones previas, incluida la tuya si editas tu propia cuenta: inicia sesión de nuevo.

## 5. Configurar correo de recuperación

Usa un servicio SMTP autorizado por tu institución. Configura sus valores reales en `GAS/backend`:

```powershell
dotnet user-secrets set "Seguridad:UrlPublica" "http://localhost:5298"
dotnet user-secrets set "Smtp:Host" "SERVIDOR_SMTP"
dotnet user-secrets set "Smtp:Port" "587"
dotnet user-secrets set "Smtp:EnableSsl" "true"
dotnet user-secrets set "Smtp:From" "CORREO_REMITENTE"
dotnet user-secrets set "Smtp:User" "USUARIO_SMTP"
dotnet user-secrets set "Smtp:Password" "CREDENCIAL_SMTP"
```

Reinicia el backend. En el login selecciona **Restablece contraseña**. El enlace lleva a `recuperar.html` y permite crear una nueva contraseña; luego debes iniciar sesión de nuevo. En un servidor usa el dominio HTTPS real en UrlPublica. No se entrega el token en una respuesta API ni se imprime en logs.

Sin SMTP configurado se devuelve 503 con un mensaje claro. Con SMTP configurado se muestra la misma respuesta para correos existentes y desconocidos; si falla la entrega se registra una advertencia sin exponer el token. El adaptador incluido usa SMTP con usuario/contraseña y STARTTLS: si tu proveedor exige OAuth2, necesitas sustituir ese adaptador o usar un relay autorizado. No se configura ni se envía correo real durante esta entrega.

## Rutas principales

Todas las mutaciones API requieren `X-GAS-Request: 1` y JSON. La interfaz agrega esa cabecera. La cookie es HttpOnly; no se guarda la contraseña ni la sesión en localStorage. Se utiliza el mismo origen y no se habilita CORS.

| Método y ruta | Uso |
|---|---|
| POST /api/auth/login | Validar credenciales y abrir sesión |
| GET /api/auth/me | Consultar cuenta autenticada |
| POST /api/auth/actividad | Renovar última actividad de una sesión todavía válida |
| POST /api/auth/logout | Revocar sesión actual |
| POST /api/auth/recuperar | Solicitar correo de recuperación |
| POST /api/auth/restablecer | Canjear token y cambiar contraseña |
| POST /api/auth/cambiar-password | Cambiar contraseña conociendo la actual |
| GET /api/roles | Consultar catálogo de roles activos |
| GET /api/usuarios | Listar y filtrar |
| GET /api/usuarios/{id} | Consultar uno |
| POST /api/usuarios | Crear |
| PUT /api/usuarios/{id} | Editar datos, rol y estado |
| DELETE /api/usuarios/{id} | Baja lógica |

La actividad se comunica como máximo cada 30 segundos mientras interactúas. El temporizador no renueva por sí solo una sesión inactiva. Cada pestaña tiene su contador visual; el servidor comparte la sesión del navegador. Un cierre manual revoca esa sesión. Un cambio de contraseña/rol/estado revoca todas las sesiones del usuario.

## Validación y mantenimiento

Consulta `tests/PRUEBAS.md` y `tests/smoke.py`. Usa una base de pruebas para esas comprobaciones: crean usuarios. Los resultados de validación de esta entrega están al final de ese documento.

Para un despliegue persistente, utiliza HTTPS y conserva las claves de Data Protection del servidor. Si hay varias instancias, comparte las claves y considera un limitador distribuido: el límite por cuenta está en MySQL y el límite por IP está en memoria de cada instancia. Las fechas de seguridad usan UTC. La tabla de sesiones y los tokens expirados pueden limpiarse periódicamente; no borres los logs sin una política de conservación.

Referencia técnica de autenticación por cookies: https://learn.microsoft.com/aspnet/core/security/authentication/cookie?view=aspnetcore-10.0
