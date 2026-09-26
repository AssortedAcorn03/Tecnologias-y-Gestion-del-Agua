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

const contentArea = document.getElementById("contentArea");
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
                    tesista con la información básica necesaria
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
                    registrar el nuevo tesista.
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
                tesista o egresado, puedes seleccionarlo
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

                    <strong>Tesista</strong>

                    <span>
                        El usuario es un
                        tesista del programa.
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
                    Si seleccionas Tesista o Egresado,
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
                                Tesista
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


                    <!-- NOTA TESISTA / EGRESADO -->

                    <div class="edit-information-message">

                        <div class="edit-information-icon">
                            i
                        </div>

                        <p>
                            Si seleccionas Tesista o Egresado,
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