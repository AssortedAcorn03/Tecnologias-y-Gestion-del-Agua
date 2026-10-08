// ==================================================
// PANEL DEL egresado
// ==================================================


// ==================================================
// ELEMENTOS DEL MENÚ
// ==================================================

const inicioAlumnoButton = document.getElementById("inicioegresadoButton");
const perfilAlumnoButton = document.getElementById("perfilegresadoButton");
const encuestasButton = document.getElementById("encuestasButton");
const reportesAlumnoButton = document.getElementById("reportesegresadoButton");
const ayudaAlumnoButton = document.getElementById("ayudaegresadoButton");
const cerrarSesionAlumnoButton = document.getElementById("cerrarSesionegresadoButton");
const contentArea = document.getElementById("contentArea");

// ==================================================
// INICIO
// ==================================================

inicioAlumnoButton.addEventListener("click", function () {

    document.querySelectorAll(".sidebar-item, .sidebar-subitem")
        .forEach(item => {
            item.classList.remove("active");
        });


    inicioAlumnoButton.classList.add("active");


    contentArea.innerHTML = "";

});


// ==================================================
// MI PERFIL
// ==================================================

perfilAlumnoButton.addEventListener("click", function () {

    // Quitar selección anterior
    document.querySelectorAll(".sidebar-item, .sidebar-subitem")
        .forEach(item => {
            item.classList.remove("active");
        });

    // Marcar Mi perfil como activo
    perfilAlumnoButton.classList.add("active");


    // ==================================================
    // CONTENIDO DEL PERFIL
    // ==================================================

    contentArea.innerHTML = `

        <div class="graduate-profile-page">

            <!-- ==========================================
                 ENCABEZADO
            =========================================== -->

            <div class="graduate-profile-header">

                <h2>
                    Mi perfil
                </h2>

                <p>
                    Consulta y actualiza tu información personal y laboral.
                </p>

            </div>


            <!-- ==========================================
                 INFORMACIÓN PERSONAL
            =========================================== -->

            <section class="graduate-profile-card">

                <div class="graduate-profile-card-header">

                    <div>
                        <h3>
                            Información personal
                        </h3>

                        <p>
                            Información general del egresado.
                        </p>
                    </div>

                </div>


                <div class="graduate-profile-grid">

                    <!-- CLAVE DEL ALUMNO -->

                    <div class="graduate-profile-field">

                        <label>
                            Clave del alumno
                        </label>

                        <input
                            type="text"
                            value="201812345"
                            readonly>

                    </div>


                    <!-- IDENTIFICADOR DEL EGRESADO -->

                    <div class="graduate-profile-field">

                        <label>
                            Identificador único de egresado
                        </label>

                        <input
                            type="text"
                            value="MTGA-2024-015"
                            readonly>

                    </div>


                    <!-- NOMBRE COMPLETO -->

                    <div class="graduate-profile-field">

                        <label>
                            Nombre completo
                        </label>

                        <input
                            type="text"
                            value="Juan Pérez Martínez"
                            readonly>

                    </div>


                    <!-- GENERACIÓN -->

                    <div class="graduate-profile-field">

                        <label>
                            Generación de egreso
                        </label>

                        <input
                            type="text"
                            value="2022-2024"
                            readonly>

                    </div>


                    <!-- FECHA DE EGRESO -->

                    <div class="graduate-profile-field">

                        <label>
                            Fecha de egreso
                        </label>

                        <input
                            type="text"
                            value="15/05/2025"
                            readonly>

                    </div>


                    <!-- CORREO -->

                    <div class="graduate-profile-field">

                        <label>
                            Correo electrónico
                        </label>

                        <input
                            type="email"
                            value="juan.perez@alumno. uaslp.mx"
                            readonly>

                    </div>


                    <!-- TELÉFONO -->

                    <div class="graduate-profile-field">

                        <label>
                            Teléfono
                        </label>

                        <input
                            type="text"
                            value="444 123 4567"
                            readonly>

                    </div>

                </div>


                <!-- BOTÓN -->

                <div class="graduate-profile-actions">

                    <button
                        type="button"
                        class="graduate-update-button"
                        id="actualizarDatosPersonalesButton">

                        Actualizar datos

                    </button>

                </div>

            </section>



            <!-- ==========================================
                 INFORMACIÓN LABORAL
            =========================================== -->

            <section class="graduate-profile-card">

                <div class="graduate-profile-card-header">

                    <div>
                        <h3>
                            Información laboral
                        </h3>

                        <p>
                            Información relacionada con tu situación laboral.
                        </p>
                    </div>

                    <button
                        type="button"
                        class="graduate-update-button"
                        id="actualizarDatosLaboralesButton">

                        Actualizar datos

                    </button>

                </div>


                <div class="graduate-profile-grid">

                    <!-- INSTITUCIÓN -->

                    <div class="graduate-profile-field">

                        <label>
                            Nombre de la institución o empresa
                        </label>

                        <input
                            type="text"
                            value="Universidad Autónoma de San Luis Potosí"
                            readonly>

                    </div>


                    <!-- PUESTO -->

                    <div class="graduate-profile-field">

                        <label>
                            Puesto
                        </label>

                        <input
                            type="text"
                            value="Ingeniero de proyectos"
                            readonly>

                    </div>


                    <!-- ÁREA -->

                    <div class="graduate-profile-field">

                        <label>
                            Área profesional
                        </label>

                        <input
                            type="text"
                            value="Ingeniería y desarrollo"
                            readonly>

                    </div>


                    <!-- FECHA INICIO -->

                    <div class="graduate-profile-field">

                        <label>
                            Fecha de inicio
                        </label>

                        <input
                            type="text"
                            value="01/08/2025"
                            readonly>

                    </div>


                    <!-- FECHA FIN -->

                    <div class="graduate-profile-field">

                        <label>
                            Fecha de fin
                        </label>

                        <input
                            type="text"
                            value="Actualmente"
                            readonly>

                    </div>

                </div>

            </section>

        </div>

    `;


    // ==================================================
    // BOTONES DE ACTUALIZACIÓN
    // ==================================================

    const actualizarPersonales =
        document.getElementById("actualizarDatosPersonalesButton");

    const actualizarLaborales =
        document.getElementById("actualizarDatosLaboralesButton");


   actualizarPersonales.addEventListener("click", function () {

    contentArea.innerHTML = `

        <div class="graduate-update-page">

            <!-- ==========================================
                 ENCABEZADO
            =========================================== -->

            <div class="graduate-update-header">

                <h2>
                    Actualización de datos personales
                </h2>

                <p>
                    Mantén tu información personal actualizada para mantener
                    contacto y recibir información relevante.
                </p>

            </div>


            <!-- ==========================================
                 NOTA INFORMATIVA
            =========================================== -->

            <div class="graduate-update-info">

                <span class="graduate-info-icon">
                    i
                </span>

                <span>
                    Algunos datos no pueden ser modificados.
                    Si necesitas actualizar tu nombre, acude a coordinación.
                </span>

            </div>


            <!-- ==========================================
                 DATOS PERSONALES
            =========================================== -->

            <section class="graduate-update-card">

                <h3>
                    Datos personales
                </h3>


                <div class="graduate-update-grid">


                    <!-- NOMBRE -->

                    <div class="graduate-update-field graduate-field-full">

                        <label>
                            Nombre completo
                        </label>

                        <div class="graduate-input-lock">

                            <input
                                type="text"
                                value="Juan Pérez Martínez"
                                readonly>

                            <span>
                                🔒
                            </span>

                        </div>

                        <small>
                            Este dato no puede ser modificado.
                        </small>

                    </div>


                    <!-- CORREO -->

                    <div class="graduate-update-field">

                        <label>
                            Correo electrónico
                            <span>*</span>
                        </label>

                        <input
                            type="email"
                            value="juan.perez@correo.com">

                    </div>


                    <!-- TELÉFONO -->

                    <div class="graduate-update-field">

                        <label>
                            Teléfono
                            <span>*</span>
                        </label>

                        <input
                            type="text"
                            value="444 123 4567">

                    </div>


                    <!-- DOMICILIO -->

                    <div class="graduate-update-field">

                        <label>
                            Domicilio o ciudad
                        </label>

                        <input
                            type="text"
                            value="San Luis Potosí, S.L.P., México">

                    </div>


                    <!-- OTROS MEDIOS -->

                    <div class="graduate-update-field graduate-field-full">

                        <label>
                            Otros medios de contacto
                        </label>

                        <input
                            type="text"
                            value="LinkedIn: juanperez / WhatsApp: 444 123 4567">

                    </div>

                </div>


                <!-- ==========================================
                     BOTONES
                =========================================== -->

                <div class="graduate-update-actions">

                    <button
                        type="button"
                        class="graduate-cancel-button"
                        id="cancelarActualizacionPersonalButton">

                        Cancelar

                    </button>


                    <button
                        type="button"
                        class="graduate-save-button"
                        id="agregarCambiosPersonalesButton">

                        Agregar cambios

                    </button>

                </div>

            </section>

        </div>

    `;


    // ==================================================
    // CANCELAR
    // ==================================================

    const cancelarActualizacion =
        document.getElementById(
            "cancelarActualizacionPersonalButton"
        );


    cancelarActualizacion.addEventListener("click", function () {

        // Regresar al perfil
        perfilAlumnoButton.click();

    });


    // ==================================================
    // AGREGAR CAMBIOS
    // ==================================================

    const agregarCambios =
        document.getElementById(
            "agregarCambiosPersonalesButton"
        );


    agregarCambios.addEventListener("click", function () {

        // Funcionalidad pendiente
        console.log("Agregar cambios personales");

    });

});


   // ==================================================
// ACTUALIZAR DATOS LABORALES
// ==================================================

actualizarLaborales.addEventListener("click", function () {

    contentArea.innerHTML = `

        <div class="graduate-update-page">

            <!-- ==========================================
                 ENCABEZADO
            =========================================== -->

            <div class="graduate-update-header">

                <h2>
                    Actualización de datos laborales
                </h2>

                <p>
                    Mantén actualizada tu información laboral
                    para dar seguimiento a tu situación profesional.
                </p>

            </div>


            <!-- ==========================================
                 AVISO
            =========================================== -->

            <div class="graduate-update-info">

                <span class="graduate-info-icon">
                    i
                </span>

                <span>
                    La información disponible para modificar depende
                    de tu situación laboral actual.
                </span>

            </div>


            <!-- ==========================================
                 INFORMACIÓN LABORAL
            =========================================== -->

            <section class="graduate-update-card">

                <h3>
                    Información laboral
                </h3>


                <div class="graduate-update-grid">


                    <!-- ==================================
                         SITUACIÓN LABORAL
                    =================================== -->

                    <div class="graduate-update-field">

                        <label>
                            Situación laboral
                            <span>*</span>
                        </label>

                        <select
                            id="situacionLaboralEgresado"
                            class="graduate-update-select">

                            <option value="empleado" selected>
                                Con trabajo
                            </option>

                            <option value="desempleado">
                                Sin trabajo
                            </option>

                        </select>

                    </div>


                    <!-- ==================================
                         INSTITUCIÓN / EMPRESA
                    =================================== -->

                    <div class="graduate-update-field">

                        <label>
                            Nombre de la institución o empresa
                        </label>

                        <input
                            type="text"
                            id="institucionLaboral"
                            value="Universidad Autónoma de San Luis Potosí">

                    </div>


                    <!-- ==================================
                         PUESTO
                    =================================== -->

                    <div class="graduate-update-field">

                        <label>
                            Puesto
                        </label>

                        <input
                            type="text"
                            id="puestoLaboral"
                            value="Ingeniero de proyectos">

                    </div>


                    <!-- ==================================
                         ÁREA PROFESIONAL
                    =================================== -->

                    <div class="graduate-update-field">

                        <label>
                            Área profesional
                        </label>

                        <input
                            type="text"
                            id="areaProfesional"
                            value="Ingeniería y desarrollo">

                    </div>


                    <!-- ==================================
                         FECHA DE INICIO
                    =================================== -->

                    <div class="graduate-update-field">

                        <label>
                            Fecha de inicio
                        </label>

                        <input
                            type="date"
                            id="fechaInicioLaboral"
                            value="2025-08-01">

                    </div>


                    <!-- ==================================
                         FECHA DE FIN
                    =================================== -->

                    <div class="graduate-update-field">

                        <label>
                            Fecha de fin
                        </label>

                        <input
                            type="date"
                            id="fechaFinLaboral">

                    </div>


                    <!-- ==================================
                         RELACIÓN CON EL POSGRADO
                    =================================== -->

                    <div class="graduate-update-field">

                        <label>
                            Relación del empleo con el posgrado
                        </label>

                        <select
                            id="relacionPosgrado"
                            class="graduate-update-select">

                            <option value="directa" selected>
                                Directamente relacionada
                            </option>

                            <option value="indirecta">
                                Indirectamente relacionada
                            </option>

                            <option value="ninguna">
                                No relacionada
                            </option>

                        </select>

                    </div>

                </div>


                <!-- ==========================================
                     MENSAJE DINÁMICO
                =========================================== -->

                <div
                    id="mensajeSituacionLaboral"
                    class="graduate-labor-message">

                    Si tienes trabajo, puedes actualizar
                    todos los datos de tu empleo actual.

                </div>


                <!-- ==========================================
                     BOTONES
                =========================================== -->

                <div class="graduate-update-actions">

                    <button
                        type="button"
                        class="graduate-cancel-button"
                        id="cancelarActualizacionLaboralButton">

                        Cancelar

                    </button>


                    <button
                        type="button"
                        class="graduate-save-button"
                        id="agregarCambiosLaboralesButton">

                        Agregar cambios

                    </button>

                </div>

            </section>

        </div>

    `;


    // ==================================================
    // ELEMENTOS
    // ==================================================

    const situacionLaboral =
        document.getElementById("situacionLaboralEgresado");

    const institucion =
        document.getElementById("institucionLaboral");

    const puesto =
        document.getElementById("puestoLaboral");

    const area =
        document.getElementById("areaProfesional");

    const fechaInicio =
        document.getElementById("fechaInicioLaboral");

    const fechaFin =
        document.getElementById("fechaFinLaboral");

    const relacion =
        document.getElementById("relacionPosgrado");

    const mensaje =
        document.getElementById("mensajeSituacionLaboral");


    // ==================================================
    // ACTUALIZAR CAMPOS SEGÚN SITUACIÓN LABORAL
    // ==================================================

    function actualizarSituacionLaboral() {

        if (situacionLaboral.value === "empleado") {

            // ------------------------------------------
            // CON TRABAJO
            // ------------------------------------------

            institucion.disabled = false;
            puesto.disabled = false;
            area.disabled = false;
            fechaInicio.disabled = false;
            relacion.disabled = false;

            fechaFin.disabled = true;

            fechaFin.value = "";

            mensaje.textContent =
                "Si tienes trabajo, puedes actualizar todos los datos de tu empleo actual.";

            mensaje.classList.remove("graduate-labor-message-warning");

        } else {

            // ------------------------------------------
            // SIN TRABAJO
            // ------------------------------------------

            institucion.disabled = true;
            puesto.disabled = true;
            area.disabled = true;
            fechaInicio.disabled = true;
            relacion.disabled = true;

            fechaFin.disabled = false;

            mensaje.textContent =
                "Al indicar que no tienes trabajo, solamente puedes modificar la fecha de fin de tu último empleo.";

            mensaje.classList.add("graduate-labor-message-warning");

        }

    }


    // Ejecutar inicialmente

    actualizarSituacionLaboral();


    // Ejecutar cuando cambie la situación

    situacionLaboral.addEventListener(
        "change",
        actualizarSituacionLaboral
    );


    // ==================================================
    // CANCELAR
    // ==================================================

    const cancelarActualizacion =
        document.getElementById(
            "cancelarActualizacionLaboralButton"
        );


    cancelarActualizacion.addEventListener("click", function () {

        // Regresar al perfil
        perfilAlumnoButton.click();

    });


    // ==================================================
    // AGREGAR CAMBIOS
    // ==================================================

    const agregarCambios =
        document.getElementById(
            "agregarCambiosLaboralesButton"
        );


    agregarCambios.addEventListener("click", function () {

        // Funcionalidad pendiente
        console.log("Agregar cambios laborales");

    });

});

});
      


// ==================================================
// ENCUESTAS Y FORMULARIOS
// ==================================================

encuestasButton.addEventListener("click", function () {

    document.querySelectorAll(".sidebar-item, .sidebar-subitem")
        .forEach(item => {
            item.classList.remove("active");
        });


    encuestasButton.classList.add("active");


    contentArea.innerHTML = `

        <div class="student-content-placeholder">

            <h2>
                Encuestas y formularios
            </h2>

        </div>

    `;

});


// ==================================================
// REPORTES
// ==================================================

reportesAlumnoButton.addEventListener("click", function () {

    document.querySelectorAll(".sidebar-item, .sidebar-subitem")
        .forEach(item => {
            item.classList.remove("active");
        });


    reportesAlumnoButton.classList.add("active");


    contentArea.innerHTML = `

        <div class="student-content-placeholder">

            <h2>
                Reportes
            </h2>

        </div>

    `;

});


// ==================================================
// AYUDA
// ==================================================

ayudaAlumnoButton.addEventListener("click", function () {

    document.querySelectorAll(".sidebar-item, .sidebar-subitem")
        .forEach(item => {
            item.classList.remove("active");
        });


    ayudaAlumnoButton.classList.add("active");


    contentArea.innerHTML = `

        <div class="student-content-placeholder">

            <h2>
                Ayuda
            </h2>

        </div>

    `;

});


// ==================================================
// CERRAR SESIÓN
// ==================================================

cerrarSesionAlumnoButton.addEventListener("click", function () {

    // Por ahora solamente visual.
    // La funcionalidad real se agregará posteriormente.

    console.log("Cerrar sesión");

});