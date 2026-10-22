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

## Prueba de relaciones del backend (alumno – comité – tesis)

Prueba manual. Verifica dos cosas distintas: que la cadena completa se recorre de punta a punta
por la interfaz (parte A) y qué invariantes de esa cadena impone realmente la base de datos
frente a las que solo viven en el código (parte B).

La cadena es:

```
alumno (clave_alumno, PK asignada por la universidad)
  └── tesis (clave_alumno NOT NULL)
        ├── comite (id_tesis NOT NULL)
        │     └── comite_profesor (id_comite, rpe, id_rol_comite)
        │           └── profesor (rpe, PK natural)
        └── revision (id_tesis NOT NULL)
              └── revision_profesor (rpe, id_revision)
```

### Parte A — recorrido por la interfaz

Requiere un alumno sin tesis. Con los datos de prueba sirve Karla Guerrero (300103).

| # | Paso | Resultado esperado |
|---|---|---|
| 1 | Coordinador → Tesistas → Consultar tesis | Cada tesis muestra alumno, director, comité y avance. Si los datos salen, la cadena entera resuelve en una sola consulta |
| 2 | Entrar como el alumno sin tesis → Mi tesis | Aparece el formulario de solicitud, no una tesis existente |
| 3 | El alumno propone tesis eligiendo director | Queda en `estado_solicitud = Pendiente` y `fecha_registro = NULL`: todavía no es un registro oficial |
| 4 | Entrar como ese director → Solicitudes de tesis | La solicitud aparece en su bandeja, y solo en la suya |
| 5 | El director acepta | La tesis pasa a «En progreso» y toma `fecha_registro` |
| 6 | Coordinador → intentar registrar una revisión de esa tesis | **Rechaza con 409**: «todavía no tiene comité tutorial asignado». Es la dependencia comité → revisión |
| 7 | Director → Mis tesistas → asignar comité | Se genera la clave `CT-2026-00NN` y el formulario desaparece de esa tarjeta |
| 8 | Coordinador → registrar la misma revisión del paso 6 | Ahora sí la acepta |
| 9 | Consultar esa tesis | El avance aparece en la gráfica y la revisión queda listada |

El paso 6 es el que vale: comprueba que la regla «sin comité no hay revisiones» está aplicada en
el backend y no solo escondiendo un botón.

Consulta para confirmar el estado final de toda la cadena de una sola vez:

```sql
SELECT a.clave_alumno, CONCAT(a.nombre,' ',a.apellido_paterno) AS alumno,
       t.id_tesis, et.nombre AS estado_tesis, t.porcentaje_actual AS avance,
       c.tipo AS comite, COUNT(DISTINCT cp.rpe) AS integrantes,
       COUNT(DISTINCT r.id_revision) AS revisiones
FROM alumno a
JOIN tesis t ON t.clave_alumno = a.clave_alumno
LEFT JOIN CAT_estado_tesis et ON et.id_estado_tesis = t.id_estado_tesis
LEFT JOIN comite c ON c.id_tesis = t.id_tesis
LEFT JOIN comite_profesor cp ON cp.id_comite = c.id_comite AND cp.activo = 1
LEFT JOIN revision r ON r.id_tesis = t.id_tesis
GROUP BY a.clave_alumno, alumno, t.id_tesis, et.nombre, t.porcentaje_actual, c.id_comite, c.tipo;
```

### Parte B — integridad referencial

Se ejecuta con `mysql -u admin`. Los seis primeros casos fallan por diseño, así que no escriben
nada. Ajusta las claves a los datos que tengas.

| # | SQL | Resultado esperado |
|---|---|---|
| 1 | `INSERT INTO tesis (clave_alumno,titulo) VALUES (999999,'x');` | ERROR 1452, `fk_tesis_alumno`: no hay tesis sin alumno |
| 2 | `INSERT INTO comite (id_tesis,tipo) VALUES (9999,'x');` | ERROR 1452, `fk_comite_tesis`: no hay comité sin tesis |
| 3 | `INSERT INTO comite_profesor (id_comite,rpe,id_rol_comite) VALUES (2,999999,1);` | ERROR 1452, `fk_cp_profesor`: no hay integrante que no sea profesor |
| 4 | `DELETE FROM tesis WHERE id_tesis=3;` | ERROR 1451, `fk_comite_tesis`: una tesis con comité no se borra |
| 5 | `DELETE FROM comite WHERE id_comite=2;` | ERROR 1451, `fk_cp_comite`: un comité con integrantes no se borra |
| 6 | `DELETE FROM profesor WHERE rpe=100201;` | ERROR 1451. Lo reporta `fk_profdet_profesor`, no `fk_cp_profesor`: MySQL valida primero `profesor_detalle`. El borrado queda bloqueado igual |

Ningún FK de la cadena declara `ON DELETE`, así que todos son `RESTRICT`. No existe borrado en
cascada: eso es deliberado y conviene dejarlo asentado.

#### Casos que la base **no** impide

Estos tres sí escriben, así que van envueltos en una transacción que se revierte. Comprobado:
después del `ROLLBACK` los conteos vuelven a 1, 1 y 4.

```sql
START TRANSACTION;
INSERT INTO tesis (clave_alumno,titulo) VALUES (300115,'Segunda tesis');
SELECT COUNT(*) FROM tesis WHERE clave_alumno=300115;        -- 2: la base lo permitió
ROLLBACK;

START TRANSACTION;
INSERT INTO comite (id_tesis,tipo) VALUES (3,'CT-DUPLICADO');
SELECT COUNT(*) FROM comite WHERE id_tesis=3;                -- 2: la base lo permitió
ROLLBACK;

START TRANSACTION;
INSERT INTO comite_profesor (id_comite,rpe,id_rol_comite,activo) VALUES (2,100201,3,1);
SELECT COUNT(*) FROM comite_profesor WHERE id_comite=2 AND rpe=100201;  -- 2: permitido
ROLLBACK;
```

### Hallazgo

En toda la cadena el único UNIQUE es `uq_alumno_periodo`, sobre `alumno_detalle`. Las tres reglas
de arriba están implementadas **solo en el código**:

| Invariante | La impone la BD | La impone el código | Consecuencia |
|---|---|---|---|
| Un alumno, una sola tesis | No | Sí, consulta previa en `TesisController` | Cinco endpoints resuelven la tesis con `SingleOrDefaultAsync(t => t.clave_alumno == clave)`. Con dos filas lanzan excepción: HTTP 500, no un error manejado |
| Una tesis, un solo comité | No | Sí, `AnyAsync` en `ComitesController` y `TesisController` | Verificar-y-luego-insertar sin UNIQUE es una condición de carrera: dos peticiones simultáneas crean dos comités |
| Un profesor no se repite en un comité | No | Sí, validación en memoria | Nada impide el mismo `rpe` dos veces en un comité con roles distintos |

Las tres se cierran con tres índices (`UNIQUE` en `tesis.clave_alumno`, en `comite.id_tesis` y en
`comite_profesor(id_comite, rpe)`), pero eso es un cambio de esquema que obliga a todo el equipo a
correr otra migración, así que queda anotado y pendiente de decisión.
