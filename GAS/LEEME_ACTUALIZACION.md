# Actualización: perfil del alumno, comités y seguimiento de tesis

## Aplicación sobre tu instalación

1. Respalda tu base de datos y conserva tus archivos de configuración locales.
2. En MySQL Workbench selecciona tu esquema de GAS (por ejemplo, `seguimiento_posgrado`). Abre y ejecuta **database/actualizacion_perfiles_tesis.sql**. No ejecutes de nuevo DB.sql: ese archivo corresponde a la instalación inicial.
3. Usa las carpetas backend y frontend incluidas en este proyecto. Conserva tu conexión `ConnectionStrings:GasDb` en user-secrets. El proyecto mantiene .NET 10 y sus dependencias originales.
4. Desde GAS/backend ejecuta `dotnet build` y después `dotnet run`. Abre `http://localhost:5298/login.html` (o el puerto de tu launchSettings). Estas vistas se sirven desde ASP.NET; no se abren con file:// ni necesitan Next.js.
5. Cierra sesiones anteriores e inicia sesión nuevamente. Si la cuenta exige cambiar la contraseña inicial, primero pasa por Cuenta y vuelve a entrar.

## Alumno

- El login dirige a alumno.html. Inicio reutiliza la tarjeta existente de Mi perfil y consulta el alumno relacionado por `alumno.id_usuario` con la sesión autenticada.
- Nombre, matrícula, programa, generación, semestre y estado vienen de la base. No se elige la identidad mediante parámetros del navegador.
- Crea alumnos desde el alta/importación existente, que crea también su usuario. Crear solamente una cuenta con rol Alumno no crea un expediente académico.
- El SQL vincula expedientes antiguos sin usuario únicamente cuando la matrícula coincide exactamente con la clave institucional de una cuenta Alumno libre. Si no coincide, el panel muestra el problema; no vincula por semejanza de nombre.
- Mi tesis permite registrar título, resumen y protocolo PDF de hasta 10 MB. El registro se guarda una sola vez por alumno y conserva el archivo fuera de la carpeta pública, en backend/App_Data/protocolos. Incluye esa carpeta en tus respaldos.
- Mi tesis muestra estado, porcentaje, comité, documentos, historial y dictamen final. El alumno no puede evaluar ni resolver su propia tesis.
- Las opciones existentes de modalidad guardan la selección; si ya hay una tesis, el cambio se solicita al coordinador. El diálogo TOEFL muestra además el resultado del expediente. Sus textos informativos originales se conservaron.

## Profesores y comités

1. En la gestión existente de usuarios crea una cuenta con rol **Profesor**.
2. En **Clave institucional** escribe su **RPE**: entero positivo, sin ceros iniciales, de hasta nueve cifras. Es la identidad del profesor; no es una matrícula estudiantil. Si ya existe la cuenta, edítala y guarda con ese RPE.
3. Al guardar se crea/vincula profesor y profesor_detalle dentro de la misma transacción. No se permite ocupar un RPE asociado a otra cuenta ni cambiarlo cuando ya está vinculado. El nombre completo se conserva en usuario; el listado de selección usa ese nombre.
4. En Alta de comité los selectores se cargan con profesores vinculados a cuentas activas con rol Profesor. Una persona puede participar en distintos comités; dentro de un mismo comité no puede ocupar dos posiciones.
5. Primero debe existir la tesis del alumno. Selecciona director, codirector opcional y entre uno y tres sinodales. La cantidad seleccionada debe coincidir con el formulario. Se valida la fecha, el identificador del comité y que la tesis no tenga otro comité.
6. Editar integrantes desactiva las asignaciones anteriores y conserva el historial. Las escrituras simultáneas se serializan.

Los roles de **Director, Codirector y Sinodal** son específicos del comité; no reemplazan el rol global Profesor. Para conservar el catálogo original, el sinodal se almacena como **Asesor** (id determinado por nombre, no por número fijo).

## RF-01.10.4 y RF-01.10.5

- Profesor: Tesis → Consulta de tesis o Evaluaciones → Evaluación de tesis. Solo aparecen tesis con una asignación activa para ese profesor.
- Administrador/coordinador: Comités → Consulta → seleccionar comité. Debajo de sus integrantes se muestra el seguimiento de la tesis.
- Los integrantes activos pueden guardar avance entre 0 y 100 y comentarios obligatorios. El porcentaje no disminuye. Cada guardado agrega una revisión, conserva las anteriores y actualiza el porcentaje actual.
- Con 100 % pasa a En evaluación. Director, codirector y administración pueden registrar Aceptada o No aceptada con dictamen obligatorio; se exige un comité con director activo. Esta es la regla operativa implementada para el cierre.
- La resolución conserva fecha y usuario responsable, añade una revisión y cierra nuevas evaluaciones. No convierte automáticamente al alumno en Titulado: esa es una decisión académica distinta.
- Si otra persona guardó mientras el formulario estaba abierto, se rechaza la versión anterior y se pide recargar. El porcentaje y su revisión se guardan en la misma transacción.

## Qué se conservó

Se conservaron los estilos CSS y la estructura visual de los HTML. Los HTML solo agregan referencias a scripts. Los scripts conectan los controles existentes; Inicio reutiliza la tarjeta de perfil y el seguimiento agrega sus controles dentro del detalle del comité y las secciones existentes del profesor. No se rediseñaron pantallas.

Las secciones que ya eran marcadores de posición de Encuestas, Reportes, Mensajes o Ayuda siguen así; esta entrega conecta perfiles, comités y tesis, no implementa esos módulos adicionales.

## Verificación

Ejecutado en el entorno de preparación:

- `node tests/perfiles_frontend.cjs`: seis casos de navegación por rol/cambio obligatorio, envío de cabecera de seguridad, versión de avance, manejo de conflicto y sintaxis de todos los scripts.
- Comparación contra el ZIP original: CSS intacto y HTML visual conservado, excepto carga de scripts y espacios de formato.

No fue posible ejecutar `dotnet build`, iniciar MySQL ni hacer la prueba completa de navegador en el entorno de preparación: no están instalados el SDK .NET, el servidor MySQL ni el ejecutable de navegador. La compilación y la integración real quedan por verificar en tu equipo; no se reportan como aprobadas.

Prueba de aceptación recomendada en una base de pruebas:

1. Inicia sesión con dos alumnos distintos: cada uno debe ver su nombre y matrícula. El alumno sin vínculo debe recibir un aviso, nunca datos de otro alumno.
2. Registra una tesis con PDF. Recarga y confirma que título, resumen y documento siguen disponibles. Un segundo registro debe rechazarse.
3. Crea tres profesores activos por RPE. Comprueba que aparecen en Alta de comité; un profesor inactivo no debe aparecer. Intenta repetir un RPE y un integrante: ambos deben rechazarse.
4. Asigna director, codirector opcional y sinodales. Inicia sesión con un profesor asignado y otro sin asignar: solo el primero debe consultar esa tesis.
5. Guarda avance 40, después 70 y después 100. Comprueba historial y que el alumno ve el avance. Intenta guardar 101 o reducirlo: debe rechazarse.
6. Abre dos formularios de la misma tesis. Guarda uno y luego el otro: el segundo debe informar conflicto. Recarga.
7. Intenta resolver como alumno o sinodal: debe rechazarse. Resuelve como director con dictamen. Verifica persistencia, historial, fecha y bloqueo de cambios posteriores.
8. Cambia el ID de tesis o documento en una petición del otro alumno/profesor: debe responder 404. No debe descargar documentos ajenos.
9. Prueba cierre de sesión, cambio obligatorio de contraseña y regreso desde Cuenta al panel correspondiente.

Archivos principales añadidos: MiPerfilController.cs, TesisController.cs, tesis_seguimiento.cs, TesisConfig.cs, alumno-datos.js, maestros-datos.js, tesis-api.js y el SQL de actualización.
