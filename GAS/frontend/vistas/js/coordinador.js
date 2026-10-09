// ==================================================
// PANEL DEL COORDINADOR
// ==================================================


// --------------------------------------------------
// ELEMENTOS DEL DOM
// --------------------------------------------------
const alumnosButton = document.getElementById("alumnosButton");
const alumnosMenu = document.getElementById("alumnosMenu");
const alumnosSubmenu = document.getElementById("alumnosSubmenu");
const alumnosArrow = document.getElementById("alumnosArrow");
const usuariosButton = document.getElementById("usuariosButton");
const usuariosSubmenu = document.getElementById("usuariosSubmenu");
const usuariosArrow = document.getElementById("usuariosArrow");
const agregarAlumnoButton = document.getElementById("agregarAlumnoButton");
const consultarAlumnoButton = document.getElementById("consultarAlumnoButton");
const altaUsuarioButton = document.getElementById("altaUsuarioButton");
const listadoUsuariosButton = document.getElementById("listadoUsuariosButton");

// ==================================================
// EGRESADOS
// ==================================================

const egresadosMenu = document.getElementById("egresadosMenu");
const egresadosSubmenu = document.getElementById("egresadosSubmenu");
const egresadosArrow = document.getElementById("egresadosArrow");
const registrarEgresadoButton = document.getElementById("registrarEgresadoButton");
const consultarEgresadoButton = document.getElementById("consultarEgresadoButton");
const modificarEgresadoButton = document.getElementById("modificarEgresadoButton");
const contentArea = document.getElementById("contentArea");

// ==================================================
// MENÚ EGRESADOS
// ==================================================

egresadosMenu.addEventListener("click", function () {

    const submenuVisible =
        egresadosSubmenu.style.display === "flex";

    if (submenuVisible) {

        egresadosSubmenu.style.display = "none";

        egresadosArrow.textContent = "⌄";

    } else {

        egresadosSubmenu.style.display = "flex";

        egresadosArrow.textContent = "⌃";

    }

});
// ==================================================
// REGISTRAR EGRESADO
// ==================================================

registrarEgresadoButton.addEventListener("click", function (event) {

    event.stopPropagation();

    // Quitar selección anterior
    document
        .querySelectorAll(".sidebar-item, .sidebar-subitem")
        .forEach(item => {
            item.classList.remove("active");
        });

    // Marcar Registrar
    registrarEgresadoButton.classList.add("active");

    mostrarRegistrarEgresado();

});
// ==================================================
// VISTA REGISTRAR EGRESADO
// ==================================================

function mostrarRegistrarEgresado() {

    contentArea.innerHTML = `

        <div class="graduate-page">

            <!-- ==========================================
                 ENCABEZADO
            =========================================== -->

            <div class="graduate-header">

                <h2>
                    Nuevo egresado
                </h2>

                <button
                    type="button"
                    class="back-button">

                    ← Volver a egresados

                </button>

            </div>


            <!-- ==========================================
                 INFORMACIÓN
            =========================================== -->

            <div class="graduate-information">

                <span class="information-icon">
                    i
                </span>

                <span>
                    Complete la información del nuevo egresado.
                    Los campos marcados con
                    <strong>*</strong>
                    son obligatorios.
                </span>

            </div>


            <!-- ==========================================
                 DATOS PERSONALES Y ACADÉMICOS
            =========================================== -->

            <section class="graduate-card">

                <h3>
                    Datos personales y académicos
                </h3>


                <!-- IDENTIFICADORES -->

                <div class="graduate-grid two-columns">

                    <div class="form-group">

                        <label>
                            Identificador único de alumno
                            <span>*</span>
                        </label>

                        <input
                            type="text"
                            placeholder="Ej. 201812345">

                    </div>


                    <div class="form-group">

                        <label>
                            Clave egresado
                            <span>*</span>
                        </label>

                        <input
                            type="text"
                            placeholder="Ej. MTGA-2024-015">

                    </div>

                </div>


                <!-- NOMBRE -->

                <div class="graduate-grid three-columns">

                    <div class="form-group">

                        <label>
                            Nombre(s)
                            <span>*</span>
                        </label>

                        <input
                            type="text"
                            placeholder="Ej. Juan">

                    </div>


                    <div class="form-group">

                        <label>
                            Apellido paterno
                            <span>*</span>
                        </label>

                        <input
                            type="text"
                            placeholder="Ej. Pérez">

                    </div>


                    <div class="form-group">

                        <label>
                            Apellido materno
                        </label>

                        <input
                            type="text"
                            placeholder="Ej. Martínez">

                    </div>

                </div>


                <!-- GENERACIÓN -->

                <div class="graduate-grid">

                    <div class="form-group">

                        <label>
                            Generación
                            <span>*</span>
                        </label>

                        <select>

                            <option value="">
                                Seleccionar generación
                            </option>

                            <option>
                                2022-2024
                            </option>

                            <option>
                                2023-2025
                            </option>

                            <option>
                                2024-2026
                            </option>

                        </select>

                    </div>

                </div>


                <!-- ======================================
                     EMPLEO
                ======================================= -->

                <div class="employment-section">

                    <div class="employment-header">

                        <div>

                            <strong>
                                ¿El egresado está empleado?
                            </strong>

                            <span>
                                Active esta opción si el egresado
                                cuenta con empleo actual.
                            </span>

                        </div>


                        <label class="switch">

                            <input
                                type="checkbox"
                                id="empleadoEgresado">

                            <span class="slider"></span>

                        </label>

                    </div>


                    <div class="employment-fields">

                        <!-- EMPRESA -->

                        <div class="form-group">

                            <label>
                                Empresa
                            </label>

                            <div class="input-with-button">

                                <input
                                    type="text"
                                    id="empresaEgresado"
                                    placeholder="Seleccionar empresa"
                                    disabled>

                                <button
                                    type="button"
                                    class="select-button"
                                    id="seleccionarEmpresaButton">

                                    ☷
                                    Seleccionar

                                </button>

                            </div>

                        </div>


                        <!-- ÁREA Y UBICACIÓN -->

                        <div class="graduate-grid two-columns">

                            <div class="form-group">

                                <label>
                                    Área profesional
                                </label>

                                <input
                                    type="text"
                                    placeholder="Ej. Ingeniería y desarrollo"
                                    disabled>

                            </div>


                            <div class="form-group">

                                <label>
                                    Ubicación
                                </label>

                                <input
                                    type="text"
                                    placeholder="Ej. San Luis Potosí, S.L.P."
                                    disabled>

                            </div>

                        </div>

                    </div>

                </div>


                <!-- ======================================
                     CONTACTO
                ======================================= -->

                <div class="graduate-grid two-columns contact-grid">

                    <div class="form-group">

                        <label>
                            Correo electrónico
                            <span>*</span>
                        </label>

                        <input
                            type="email"
                            placeholder="Ej. juan.perez@correo.com">

                    </div>


                    <div class="form-group">

                        <label>
                            Otro medio de contacto
                        </label>

                        <input
                            type="text"
                            placeholder="Ej. 444 123 4567 / LinkedIn / WhatsApp">

                    </div>

                </div>

            </section>


            <!-- ==========================================
                 BOTONES
            =========================================== -->

            <div class="graduate-actions">

                <button
                    type="button"
                    class="graduate-cancel-button">

                    Cancelar

                </button>


                <button
                    type="button"
                    class="graduate-save-button">

                    Guardar egresado

                </button>

            </div>

        </div>

    `;


    // ==========================================
    // SWITCH DE EMPLEO
    // ==========================================

    const empleado =
        document.getElementById("empleadoEgresado");

    const employmentFields =
        document.querySelector(".employment-fields");


    empleado.addEventListener("change", function () {

        if (empleado.checked) {

            employmentFields.classList.add("enabled");

        } else {

            employmentFields.classList.remove("enabled");

        }

    });

}
// ==================================================
// CONSULTAR EGRESADOS
// ==================================================

consultarEgresadoButton.addEventListener("click", function (event) {

    event.stopPropagation();

    // Quitar selección anterior
    document
        .querySelectorAll(".sidebar-item, .sidebar-subitem")
        .forEach(item => {
            item.classList.remove("active");
        });

    // Marcar opción seleccionada
    consultarEgresadoButton.classList.add("active");

    mostrarConsultaEgresados();

});
// ==================================================
// VISTA CONSULTA DE EGRESADOS
// ==================================================

function mostrarConsultaEgresados() {

    contentArea.innerHTML = `

        <div class="graduate-consult-page">

            <!-- ==========================================
                 ENCABEZADO
            =========================================== -->

            <div class="graduate-consult-header">

                <h2>
                    Egresados
                </h2>

                <p>
                    Consulta y administra la información de los
                    egresados del posgrado.
                </p>

            </div>


            <!-- ==========================================
                 BÚSQUEDA
            =========================================== -->

            <section class="graduate-search-card">

                <div class="graduate-card-title">

                    <h3>
                        Búsqueda de egresados
                    </h3>

                    <div class="search-actions">

                        <button
                            type="button"
                            id="limpiarFiltrosEgresados"
                            class="clear-filters-button">

                            <span>⌯</span>
                            Limpiar filtros

                        </button>

                        <button
                            type="button"
                            id="buscarEgresadosButton"
                            class="search-button">

                            <span>⌕</span>
                            Buscar

                        </button>

                    </div>

                </div>


                <div class="graduate-search-grid">

                    <!-- NOMBRE -->

                    <div class="graduate-filter">

                        <label>
                            Nombre
                        </label>

                        <div class="filter-input-icon">

                            <input
                                type="text"
                                id="filtroNombreEgresado"
                                placeholder="Ej. Juan Pérez Martínez">

                            <span>
                                ♙
                            </span>

                        </div>

                    </div>


                    <!-- GENERACIÓN -->

                    <div class="graduate-filter">

                        <label>
                            Generación
                        </label>

                        <select id="filtroGeneracionEgresado">

                            <option value="">
                                Seleccionar generación
                            </option>

                            <option value="2020-2022">
                                2020-2022
                            </option>

                            <option value="2021-2023">
                                2021-2023
                            </option>

                            <option value="2022-2024">
                                2022-2024
                            </option>

                            <option value="2023-2025">
                                2023-2025
                            </option>

                            <option value="2024-2026">
                                2024-2026
                            </option>

                        </select>

                    </div>


                    <!-- ESTADO -->

                    <div class="graduate-filter">

                        <label>
                            Estado del egresado
                        </label>

                        <select id="filtroEstadoEgresado">

                            <option value="">
                                Seleccionar estado
                            </option>

                            <option value="activo">
                                Activo
                            </option>

                            <option value="inactivo">
                                Inactivo
                            </option>

                        </select>

                    </div>


                    <!-- SITUACIÓN LABORAL -->

                    <div class="graduate-filter">

                        <label>
                            Situación laboral
                        </label>

                        <select id="filtroSituacionLaboral">

                            <option value="">
                                Seleccionar situación
                            </option>

                            <option value="con-trabajo">
                                Con trabajo
                            </option>

                            <option value="sin-trabajo">
                                Sin trabajo
                            </option>

                        </select>

                    </div>


                    <!-- IDENTIFICADOR -->

                    <div class="graduate-filter graduate-id-filter">

                        <label>
                            Identificador del egresado
                        </label>

                        <div class="id-search-container">

                            <input
                                type="text"
                                id="filtroIdentificadorEgresado"
                                placeholder="Ej. 201812345">

                            <button
                                type="button"
                                id="buscarIdentificadorEgresado"
                                class="small-search-button">

                                ⌕

                            </button>

                            <button
                                type="button"
                                id="limpiarIdentificadorEgresado"
                                class="small-clear-button">

                                ×

                            </button>

                        </div>

                    </div>

                </div>

            </section>


            <!-- ==========================================
                 RESULTADOS
            =========================================== -->

            <section class="graduate-results-card">

                <div class="results-header">

                    <h3>
                        Resultados
                    </h3>

                    <span id="totalEgresados">
                        Total de egresados: 0
                    </span>

                </div>


                <div class="graduate-table-container">

                    <table class="graduate-table">

                        <thead>

                            <tr>

                                <th>
                                    Identificador
                                </th>

                                <th>
                                    Nombre completo
                                </th>

                                <th>
                                    Generación
                                </th>

                                <th>
                                    Estado del egresado
                                </th>

                                <th>
                                    Situación laboral
                                </th>

                                <th>
                                    Última actualización
                                </th>

                                <th>
                                    Acciones
                                </th>

                            </tr>

                        </thead>


                        <tbody id="egresadosTableBody">

                            <!--
                                De momento permanece vacío.
                                Posteriormente aquí se mostrarán
                                los egresados.
                            -->

                        </tbody>

                    </table>

                </div>


                <!-- ======================================
                     PAGINACIÓN
                ======================================= -->

                <div class="graduate-pagination">

                    <span id="egresadosPaginationText">
                        No hay registros para mostrar
                    </span>

                    <div class="pagination-buttons">

                        <button
                            type="button"
                            disabled>
                            ‹
                        </button>

                        <button
                            type="button"
                            class="pagination-active">
                            1
                        </button>

                        <button
                            type="button">
                            2
                        </button>

                        <button
                            type="button">
                            3
                        </button>

                        <button
                            type="button">
                            ...
                        </button>

                        <button
                            type="button">
                            26
                        </button>

                        <button
                            type="button">
                            ›
                        </button>

                    </div>

                </div>

            </section>


            <!-- ==========================================
                 NOTA
            =========================================== -->

            <div class="graduate-note">

                <span class="note-icon">
                    i
                </span>

                <span>
                    Puedes exportar el listado de egresados
                    desde la sección de Reportes.
                </span>

            </div>

        </div>

    `;


    // ==================================================
    // LIMPIAR FILTROS
    // ==================================================

    const limpiarFiltros =
        document.getElementById("limpiarFiltrosEgresados");

    limpiarFiltros.addEventListener("click", function () {

        document.getElementById(
            "filtroNombreEgresado"
        ).value = "";

        document.getElementById(
            "filtroGeneracionEgresado"
        ).value = "";

        document.getElementById(
            "filtroEstadoEgresado"
        ).value = "";

        document.getElementById(
            "filtroSituacionLaboral"
        ).value = "";

        document.getElementById(
            "filtroIdentificadorEgresado"
        ).value = "";

    });


    // ==================================================
    // LIMPIAR IDENTIFICADOR
    // ==================================================

    document
        .getElementById("limpiarIdentificadorEgresado")
        .addEventListener("click", function () {

            document.getElementById(
                "filtroIdentificadorEgresado"
            ).value = "";

        });


    // ==================================================
    // BUSCAR
    // ==================================================

    document
        .getElementById("buscarEgresadosButton")
        .addEventListener("click", function () {

            // De momento no se realiza ninguna búsqueda.
            // La funcionalidad se agregará posteriormente.

            console.log("Búsqueda de egresados");

        });

}

// --------------------------------------------------
// MENÚ ALUMNOS
// --------------------------------------------------

alumnosButton.addEventListener("click", function () {

    const submenuVisible =
        alumnosSubmenu.style.display !== "none";

    if (submenuVisible) {

        alumnosSubmenu.style.display = "none";
        alumnosArrow.textContent = "⌄";

    } else {

        alumnosSubmenu.style.display = "flex";
        alumnosArrow.textContent = "⌃";

    }

});
// ==================================================
// AGREGAR ALUMNO
// ==================================================

agregarAlumnoButton.addEventListener("click", function () {

    contentArea.innerHTML = `

        <div class="student-page">

            <!-- ==========================================
                 ENCABEZADO
            =========================================== -->

            <div class="page-header">

                <div class="breadcrumb">
                    Alumnos
                    <span>›</span>
                    Agregar alumno
                </div>

                <h2>
                    Alta del alumno
                </h2>

                <p>
                    El sistema deberá permitir registrar un nuevo
                    alumno con la información básica necesaria
                    para incorporarlo al sistema de seguimiento
                    académico.
                </p>

            </div>


            <!-- ==========================================
                 NOTA INFORMATIVA
            =========================================== -->

            <div class="student-information-message">

                <div class="student-information-icon">
                    i
                </div>

                <p>
                    Completa todos los campos obligatorios para
                    registrar el nuevo alumno.
                </p>

            </div>


            <!-- ==========================================
                 DATOS DEL ALUMNO
            =========================================== -->

            <section class="student-form-card">

                <h3>
                    Datos del alumno
                </h3>


                <div class="student-form-grid">


                    <!-- CLAVE DEL ALUMNO -->

                    <div class="student-form-group">

                        <label>
                            Clave del alumno
                            <span>*</span>
                        </label>

                        <input
                            type="text"
                            placeholder="Ej. 20241234">

                    </div>


                    <!-- NOMBRE -->

                    <div class="student-form-group">

                        <label>
                            Nombre
                            <span>*</span>
                        </label>

                        <input
                            type="text"
                            placeholder="Ej. Juan">

                    </div>


                    <!-- APELLIDO PATERNO -->

                    <div class="student-form-group">

                        <label>
                            Apellido paterno
                            <span>*</span>
                        </label>

                        <input
                            type="text"
                            placeholder="Ej. Pérez">

                    </div>


                    <!-- APELLIDO MATERNO -->

                    <div class="student-form-group">

                        <label>
                            Apellido materno
                            <span>*</span>
                        </label>

                        <input
                            type="text"
                            placeholder="Ej. Martínez">

                    </div>


                    <!-- FECHA DE INGRESO -->

                    <div class="student-form-group">

                        <label>
                            Fecha de ingreso
                            <span>*</span>
                        </label>

                        <input
                            type="date">

                    </div>


                    <!-- PROGRAMA ACADÉMICO -->

                    <div class="student-form-group">

                        <label>
                            Programa académico
                            <span>*</span>
                        </label>

                        <select>

                            <option value="">
                                Maestría en Tecnología y Gestión del Agua
                            </option>

                        </select>

                    </div>


                    <!-- GENERACIÓN -->

                    <div class="student-form-group">

                        <label>
                            Generación
                            <span>*</span>
                        </label>

                        <select>

                            <option value="">
                                Seleccionar generación
                            </option>

                            <option>
                                2024 - 2026
                            </option>

                            <option>
                                2025 - 2027
                            </option>

                            <option>
                                2026 - 2028
                            </option>

                        </select>

                    </div>


                    <!-- SEMESTRE -->

                    <div class="student-form-group">

                        <label>
                            Semestre
                            <span>*</span>
                        </label>

                        <select>

                            <option value="">
                                Seleccionar semestre
                            </option>

                            <option>
                                Primero
                            </option>

                            <option>
                                Segundo
                            </option>

                            <option>
                                Tercero
                            </option>

                            <option>
                                Cuarto
                            </option>

                        </select>

                    </div>


                    <!-- CORREO INSTITUCIONAL -->

                    <div class="student-form-group">

                        <label>
                            Correo institucional
                            <span>*</span>
                        </label>

                        <input
                            type="email"
                            placeholder="Ej. juan.perez@alumno.uaslp.mx">

                    </div>


                    <!-- CORREO PERSONAL -->

                    <div class="student-form-group">

                        <label>
                            Correo personal
                            <span>*</span>
                        </label>

                        <input
                            type="email"
                            placeholder="Ej. juan.perez@gmail.com">

                    </div>


                    <!-- TELÉFONO -->

                    <div class="student-form-group">

                        <label>
                            Teléfono
                            <span>*</span>
                        </label>

                        <input
                            type="tel"
                            placeholder="Ej. 444 123 4567">

                    </div>


                    <!-- ESTADO ACADÉMICO -->

                    <div class="student-form-group">

                        <label>
                            Estado académico
                            <span>*</span>
                        </label>

                        <select>

                            <option>
                                Activo
                            </option>

                            <option>
                                Inactivo
                            </option>

                            <option>
                                Egresado
                            </option>

                            <option>
                                Baja temporal
                            </option>

                        </select>

                    </div>


                    <!-- MODALIDAD DE TITULACIÓN -->

                    <div class="student-form-group">

                        <label>
                            Modalidad de titulación
                            <span>*</span>
                        </label>

                        <select>

                            <option>
                                Tesis
                            </option>

                            <option>
                                Artículo
                            </option>

                            <option>
                                Examen de conocimientos
                            </option>

                        </select>

                    </div>

                </div>

            </section>


            <!-- ==========================================
                 BOTONES
            =========================================== -->

            <div class="student-form-actions">

                <button
                    type="button"
                    class="cancel-student-button">

                    Cancelar

                </button>

                <button
                    type="button"
                    class="save-student-button">

                    Guardar alumno

                </button>

            </div>

        </div>

    `;


    // Marcar opción activa

    agregarAlumnoButton.classList.add("active");

    consultarAlumnoButton.classList.remove("active");

    listadoUsuariosButton.classList.remove("active");

    altaUsuarioButton.classList.remove("active");

});

// --------------------------------------------------
// MENÚ USUARIOS
// --------------------------------------------------

usuariosButton.addEventListener("click", function () {

    const submenuVisible =
        usuariosSubmenu.style.display !== "none";

    if (submenuVisible) {

        usuariosSubmenu.style.display = "none";
        usuariosArrow.textContent = "⌄";

    } else {

        usuariosSubmenu.style.display = "flex";
        usuariosArrow.textContent = "⌃";

    }

});


// --------------------------------------------------
// ALTA DE USUARIO
// --------------------------------------------------

altaUsuarioButton.addEventListener("click", function () {

    contentArea.innerHTML = `

        <div class="page-header">

            <div class="breadcrumb">
                Usuarios
                <span>›</span>
                Alta de usuario
            </div>

            <h2>Alta de usuario</h2>

            <p>
                Registra un nuevo usuario en el sistema.
                Los campos marcados con <strong>*</strong>
                son obligatorios.
            </p>

        </div>


        <!-- ==========================================
             INFORMACIÓN
        =========================================== -->

        <div class="information-message">

            <div class="information-icon">
                i
            </div>

            <p>
                Si el usuario que deseas registrar es un
                alumno o egresado, puedes seleccionarlo
                para dirigirte al alta correspondiente.
            </p>

        </div>


        <!-- ==========================================
             TIPO DE USUARIO
        =========================================== -->

        <section class="form-card">

            <div class="section-title">

                <h3>Tipo de usuario <span>*</span></h3>

                <p>
                    Selecciona el tipo de usuario que deseas registrar.
                </p>

            </div>


            <div class="user-type-grid">


                <button
                    type="button"
                    class="user-type-card selected">

                    <div class="user-type-icon">
                        
                    </div>

                    <strong>Coordinador</strong>

                    <span>
                        Acceso para coordinadores
                        del posgrado.
                    </span>

                </button>


                <button
                    type="button"
                    class="user-type-card">

                    <div class="user-type-icon">
                        
                    </div>

                    <strong>Administrador</strong>

                    <span>
                        Acceso administrativo
                        completo al sistema.
                    </span>

                </button>


                <button
                    type="button"
                    class="user-type-card">

                    <div class="user-type-icon">
                    
                    </div>

                    <strong>Profesor</strong>

                    <span>
                        Acceso para profesores
                        y evaluadores.
                    </span>

                </button>


                <button
                    type="button"
                    class="user-type-card">

                    <div class="user-type-icon">
                        
                    </div>

                    <strong>Alumno</strong>

                    <span>
                        El usuario es un
                        alumno del programa.
                    </span>

                </button>


                <button
                    type="button"
                    class="user-type-card">

                    <div class="user-type-icon">
                    
                    </div>

                    <strong>Egresado</strong>

                    <span>
                        El usuario es un
                        egresado del programa.
                    </span>

                </button>


                <button
                    type="button"
                    class="user-type-card">

                    <div class="user-type-icon">
                        
                    </div>

                    <strong>Usuario externo temporal</strong>

                    <span>
                        Acceso temporal para
                        usuarios externos.
                    </span>

                </button>

            </div>


            <div class="information-message small">

                <div class="information-icon">
                    i
                </div>

                <p>
                    Si seleccionas Alumno o Egresado,
                    serás redirigido al formulario
                    correspondiente para registrar
                    primero sus datos.
                </p>

            </div>

        </section>


        <!-- ==========================================
             DATOS DEL USUARIO
        =========================================== -->

        <section class="form-card">

            <div class="section-title">

                <h3>Datos del usuario</h3>

            </div>


            <div class="form-grid">


                <!-- CORREO -->

                <div class="form-group">

                    <label>
                        Correo electrónico
                        <span>*</span>
                    </label>

                    <input
                        type="email"
                        placeholder="ejemplo@uaslp.mx">

                    <small>
                        Este será el identificador
                        del usuario para iniciar sesión.
                    </small>

                </div>


                <!-- CONTRASEÑA -->

                <div class="form-group">

                    <label>
                        Contraseña inicial
                        <span>*</span>
                    </label>

                    <div class="password-field">

                        <input
                            type="password"
                            placeholder="Ingresa la contraseña inicial">

                        <button
                            type="button"
                            class="password-toggle">
                            Mostrar
                        </button>

                    </div>

                    <small>
                        La contraseña debe tener
                        al menos 8 caracteres.
                    </small>

                </div>


                <!-- CONFIRMAR -->

                <div class="form-group">

                    <label>
                        Confirmar contraseña
                        <span>*</span>
                    </label>

                    <div class="password-field">

                        <input
                            type="password"
                            placeholder="Confirma la contraseña inicial">

                        <button
                            type="button"
                            class="password-toggle">
                            Mostrar
                        </button>

                    </div>

                </div>


                <!-- ROL -->

                <div class="form-group">

                   
                      <label>
        Rol asignado
        <span>*</span>
    </label>

    <input
        type="text"
        id="rolUsuario"
        value="Coordinador"
        readonly>

    <small>
        El rol se asigna automáticamente según
        el tipo de usuario seleccionado.
    </small>

                    <small>
                        Define los permisos y accesos
                        del usuario en el sistema.
                    </small>

                </div>


                <!-- ESTADO -->

                <div class="form-group status-group">

                    <label>
                        Estado
                        <span>*</span>
                    </label>

                    <label class="switch-container">

                        <input
                            type="checkbox"
                            checked>

                        <span class="switch"></span>

                        <span class="status-text">
                            Activo
                        </span>

                    </label>

                    <small>
                        Los usuarios inactivos
                        no podrán acceder al sistema.
                    </small>

                </div>

            </div>


            <!-- BOTONES -->

            <div class="form-actions">

                <button
                    type="button"
                    class="cancel-button">
                    Cancelar
                </button>

                <button
                    type="button"
                    class="save-button">
                    Guardar usuario
                </button>

            </div>

        </section>


        <!-- ==========================================
             NOTA
        =========================================== -->

        <div class="warning-message">

            <div class="warning-icon">
                !
            </div>

            <div>

                <strong>Nota importante</strong>

                <p>
                    Al guardar el usuario, se generará
                    automáticamente un identificador
                    único en el sistema.
                </p>

            </div>

        </div>

    `;

    altaUsuarioButton.classList.add("active");
    listadoUsuariosButton.classList.remove("active");
// ==================================================
// SELECCIÓN DEL TIPO DE USUARIO
// ==================================================

const userTypeCards =
    document.querySelectorAll(".user-type-card");

const rolUsuario =
    document.getElementById("rolUsuario");


userTypeCards.forEach(card => {

    card.addEventListener("click", function () {

        // Quitar la selección de todas las tarjetas
        userTypeCards.forEach(item => {
            item.classList.remove("selected");
        });

        // Marcar la tarjeta seleccionada
        this.classList.add("selected");

        // Obtener el nombre del tipo de usuario
        const tipoUsuario =
            this.querySelector("strong").textContent.trim();

        // Colocar automáticamente el rol
        rolUsuario.value = tipoUsuario;

    });

});
});

// ==================================================
// LISTADO DE USUARIOS
// ==================================================

listadoUsuariosButton.addEventListener("click", function () {

    contentArea.innerHTML = `

        <div class="users-page">


            <!-- ==========================================
                 ENCABEZADO
            =========================================== -->

            <div class="page-header">

                <div class="breadcrumb">

                    Usuarios
                    <span>›</span>
                    Listado de usuarios

                </div>

                <h2>
                    Consulta de usuarios
                </h2>

                <p>
                    Consulta y administra los usuarios registrados
                    en el sistema.
                </p>

            </div>


            <!-- ==========================================
                 FILTROS
            =========================================== -->

            <section class="filter-card">

                <div class="filter-header">

                    <h3>
                        Filtros de búsqueda
                    </h3>

                    <button
                        type="button"
                        class="clear-filters-button"
                        id="clearFiltersButton">

                        ↻
                        Limpiar filtros

                    </button>

                </div>


                <div class="filters-grid">


                    <!-- CLAVE -->

                    <div class="filter-group">

                        <label>
                            Clave o identificador
                        </label>

                        <div class="search-input">

                            <input
                                type="text"
                                id="filterClave"
                                placeholder="Buscar por clave o identificador...">

                            <span>⌕</span>

                        </div>

                    </div>


                    <!-- NOMBRE -->

                    <div class="filter-group">

                        <label>
                            Nombre asociado
                        </label>

                        <div class="search-input">

                            <input
                                type="text"
                                id="filterNombre"
                                placeholder="Buscar por nombre...">

                            <span>⌕</span>

                        </div>

                    </div>


                    <!-- ROL -->

                    <div class="filter-group">

                        <label>
                            Rol
                        </label>

                        <select id="filterRol">

                            <option value="">
                                Todos los roles
                            </option>

                            <option>
                                Coordinador
                            </option>

                            <option>
                                Administrador
                            </option>

                            <option>
                                Profesor
                            </option>

                            <option>
                                Alumno
                            </option>

                            <option>
                                Egresado
                            </option>

                            <option>
                                Usuario externo temporal
                            </option>

                        </select>

                    </div>


                    <!-- ESTADO -->

                    <div class="filter-group">

                        <label>
                            Estado
                        </label>

                        <select id="filterEstado">

                            <option value="">
                                Todos los estados
                            </option>

                            <option>
                                Activo
                            </option>

                            <option>
                                Inactivo
                            </option>

                        </select>

                    </div>


                    <!-- BUSCAR -->

                    <div class="filter-search-container">

                        <button
                            type="button"
                            class="search-button"
                            id="searchUsersButton">

                            ⌕
                            Buscar

                        </button>

                    </div>

                </div>

            </section>


            <!-- ==========================================
                 RESULTADOS
            =========================================== -->

            <section class="results-card">


                <div class="results-header">

                    <h3>
                        Resultados
                    </h3>

                    <button
                        type="button"
                        class="new-user-button"
                        id="newUserButton">

                        +
                        Nuevo usuario

                    </button>

                </div>


                <!-- TABLA -->

                <div class="users-table-container">

                    <table class="users-table">

                        <thead>

                            <tr>

                                <th>
                                    ID de usuario
                                </th>

                                <th>
                                    Nombre asociado
                                </th>

                                <th>
                                    Correo electrónico
                                </th>

                                <th>
                                    Rol
                                </th>

                                <th>
                                    Estado
                                </th>

                                <th>
                                    Acciones
                                </th>

                            </tr>

                        </thead>


                        <tbody id="usersTableBody">

                            <!--

                                Por ahora la tabla está vacía.

                                Posteriormente aquí aparecerán
                                los usuarios provenientes de
                                la base de datos.

                            -->

                        </tbody>

                    </table>


                    <!-- ESTADO VACÍO -->

                    <div
                        class="empty-users"
                        id="emptyUsers">

                        <div class="empty-users-icon">
                            
                        </div>

                        <strong>
                            No hay usuarios registrados
                        </strong>

                        <p>
                            Los usuarios registrados
                            aparecerán aquí.
                        </p>

                    </div>

                </div>


                <!-- ======================================
                     PIE DE RESULTADOS
                ======================================= -->

                <div class="results-footer">

                    <span>
                        No hay registros para mostrar
                    </span>

                    <div class="pagination">

                        <button type="button" disabled>
                            ‹
                        </button>

                        <button
                            type="button"
                            class="current-page">
                            1
                        </button>

                        <button type="button" disabled>
                            ›
                        </button>

                    </div>

                </div>

            </section>


            <!-- ==========================================
                 PANEL DE EDICIÓN
                 OCULTO INICIALMENTE
            =========================================== -->

            <aside
                class="edit-user-panel"
                id="editUserPanel">


                <div class="edit-panel-header">

                    <h3>
                        Editar usuario
                    </h3>

                    <button
                        type="button"
                        id="closeEditPanel">

                        ×

                    </button>

                </div>


                <div class="edit-panel-body">


                    <!-- ID -->

                    <div class="edit-form-group">

                        <label>
                            ID de usuario
                        </label>

                        <input
                            type="text"
                            id="editUserId"
                            readonly>

                        <small>
                            El identificador no puede ser modificado.
                        </small>

                    </div>


                    <!-- CORREO -->

                    <div class="edit-form-group">

                        <label>
                            Correo electrónico
                            <span>*</span>
                        </label>

                        <input
                            type="email"
                            id="editUserEmail"
                            placeholder="usuario@uaslp.mx">

                        <small>
                            Este será el correo utilizado
                            para iniciar sesión.
                        </small>

                    </div>


                    <!-- ROL -->

                    <div class="edit-form-group">

                        <label>
                            Rol de usuario
                            <span>*</span>
                        </label>

                        <input
                            type="text"
                            id="editUserRole"
                            readonly>

                        <small>
                            El rol se determina según
                            el tipo de usuario.
                        </small>

                    </div>


                    <!-- ESTADO -->

                    <div class="edit-form-group">

                        <label>
                            Estado de la cuenta
                            <span>*</span>
                        </label>

                        <label class="edit-switch-container">

                            <input
                                type="checkbox"
                                id="editUserStatus"
                                checked>

                            <span class="edit-switch"></span>

                            <span>
                                Activo
                            </span>

                        </label>

                        <small>
                            Los usuarios inactivos no podrán
                            acceder al sistema.
                        </small>

                    </div>


                    <!-- NOTA ALUMNO / EGRESADO -->

                    <div class="edit-information-message">

                        <div class="edit-information-icon">
                            i
                        </div>

                        <p>
                            Si seleccionas Alumno o Egresado,
                            serás redirigido al formulario
                            correspondiente para modificación
                            de sus datos.
                        </p>

                    </div>

                </div>


                <!-- BOTONES -->

                <div class="edit-panel-footer">

                    <button
                        type="button"
                        class="cancel-edit-button"
                        id="cancelEditButton">

                        Cancelar

                    </button>

                    <button
                        type="button"
                        class="save-edit-button">

                        Guardar cambios

                    </button>

                </div>

            </aside>

        </div>

    `;


    // ------------------------------------------
    // ESTADO DEL MENÚ
    // ------------------------------------------

    listadoUsuariosButton.classList.add("active");

    altaUsuarioButton.classList.remove("active");


    // ------------------------------------------
    // BOTÓN NUEVO USUARIO
    // ------------------------------------------

    const newUserButton =
        document.getElementById("newUserButton");

    newUserButton.addEventListener("click", function () {

        altaUsuarioButton.click();

    });


    // ------------------------------------------
    // CERRAR PANEL DE EDICIÓN
    // ------------------------------------------

    const closeEditPanel =
        document.getElementById("closeEditPanel");

    const cancelEditButton =
        document.getElementById("cancelEditButton");

    const editUserPanel =
        document.getElementById("editUserPanel");


    closeEditPanel.addEventListener("click", function () {

        editUserPanel.classList.remove("open");

    });


    cancelEditButton.addEventListener("click", function () {

        editUserPanel.classList.remove("open");

    });


    // ------------------------------------------
    // LIMPIAR FILTROS
    // ------------------------------------------

    const clearFiltersButton =
        document.getElementById("clearFiltersButton");

    clearFiltersButton.addEventListener("click", function () {

        document.getElementById("filterClave").value = "";
        document.getElementById("filterNombre").value = "";
        document.getElementById("filterRol").value = "";
        document.getElementById("filterEstado").value = "";

    });

});
// ==================================================
// ABRIR PANEL DE EDICIÓN
// ==================================================

function abrirEditarUsuario(usuario) {

    const editUserPanel =
        document.getElementById("editUserPanel");

    const editUserId =
        document.getElementById("editUserId");

    const editUserEmail =
        document.getElementById("editUserEmail");

    const editUserRole =
        document.getElementById("editUserRole");

    const editUserStatus =
        document.getElementById("editUserStatus");


    editUserId.value =
        usuario.id;

    editUserEmail.value =
        usuario.email;

    editUserRole.value =
        usuario.rol;

    editUserStatus.checked =
        usuario.estado === "Activo";


    editUserPanel.classList.add("open");

}