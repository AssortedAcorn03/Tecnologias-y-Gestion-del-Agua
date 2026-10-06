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