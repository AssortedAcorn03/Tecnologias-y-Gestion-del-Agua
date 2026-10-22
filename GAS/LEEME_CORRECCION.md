# Corrección de acceso y archivos de las vistas

1. Detén el backend anterior con Ctrl+C. Si usas Visual Studio, detén la depuración.
2. Extrae TODO este ZIP en una carpeta nueva, sin mezclarlo con versiones anteriores.
3. Ejecuta GAS/INICIAR_PROYECTO.cmd. Usa el mismo secreto ConnectionStrings:GasDb que ya tenías; no cambió UserSecretsId.
4. La terminal debe mostrar GAS CORRECCION 20261021-V4 y la ruta de las vistas extraídas. Si el puerto está ocupado, detén la instancia anterior; no continúes usando esa instancia.
5. Abre http://localhost:5298/login.html y recarga con Ctrl+F5.
6. http://localhost:5298/js/login.js?v=20261021-v4 debe empezar con LOGIN-ALUMNO-V4.

El alumno con requiereCambio=false entra a alumno.html. El primer cambio obligatorio se conserva; tras guardarlo se renueva la sesión y se abre su panel. Mi cuenta conserva el enlace Abrir mi panel.
Inicio reutiliza la tarjeta de perfil existente y consulta /api/mi-perfil. Si no hay alumno activo vinculado al usuario, muestra el mensaje del backend. No inventa expedientes.
Los selectores del comité consultan /api/comites/profesores: requieren profesor activo vinculado por RPE a un usuario Profesor activo. Si no aparece un profesor antiguo, edita y guarda ese usuario en Gestión de usuarios para ejecutar la vinculación existente. No se imponen límites de carga por comité.

No se requiere SQL nuevo para esta corrección. Si nunca aplicaste la actualización anterior, sigue LEEME_ACTUALIZACION.md y database/actualizacion_perfiles_tesis.sql.
Se conserva el diseño y las funcionalidades ajenas a esta corrección.
Validación: pruebas de navegación con respuestas simuladas y sintaxis JavaScript. Este entorno no tiene .NET/MySQL; falta probar compilación y conexión real en tu equipo.
