// ==================================================
// PANEL DEL ALUMNO
// ==================================================


// ==================================================
// ELEMENTOS DEL MENÚ
// ==================================================

const tesisMenu =
    document.getElementById("tesisMenu");

const tesisSubmenu =
    document.getElementById("tesisSubmenu");

const tesisArrow =
    document.getElementById("tesisArrow");

const miTesisButton =
    document.getElementById("miTesisButton");

const comiteTutorialButton =
    document.getElementById("comiteTutorialButton");

const inicioAlumnoButton =
    document.getElementById("inicioAlumnoButton");

const perfilAlumnoButton =
    document.getElementById("perfilAlumnoButton");

const encuestasButton =
    document.getElementById("encuestasButton");

const reportesAlumnoButton =
    document.getElementById("reportesAlumnoButton");

const ayudaAlumnoButton =
    document.getElementById("ayudaAlumnoButton");

const cerrarSesionAlumnoButton =
    document.getElementById("cerrarSesionAlumnoButton");

const contentArea =
    document.getElementById("contentArea");


// ==================================================
// MENÚ TESIS
// ==================================================

tesisMenu.addEventListener("click", function () {

    tesisSubmenu.classList.toggle("open");

    tesisMenu.classList.toggle("expanded");

});


// ==================================================
// MI TESIS
// ==================================================

miTesisButton.addEventListener("click", function (event) {

    event.stopPropagation();

    // Quitar selección de otros elementos

    document.querySelectorAll(".sidebar-item, .sidebar-subitem")
        .forEach(item => {
            item.classList.remove("active");
        });


    // Marcar Mi tesis

    miTesisButton.classList.add("active");


    // Por ahora solamente mostramos
    // un área vacía preparada para la vista.

    contentArea.innerHTML = `

        <div class="student-content-placeholder">

            <h2>
                Mi tesis
            </h2>

        </div>

    `;

});


// ==================================================
// COMITÉ TUTORIAL
// ==================================================

comiteTutorialButton.addEventListener("click", function (event) {

    event.stopPropagation();

    document.querySelectorAll(".sidebar-item, .sidebar-subitem")
        .forEach(item => {
            item.classList.remove("active");
        });


    comiteTutorialButton.classList.add("active");


    contentArea.innerHTML = `

        <div class="student-content-placeholder">

            <h2>
                Comité tutorial
            </h2>

        </div>

    `;

});


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

    document.querySelectorAll(".sidebar-item, .sidebar-subitem")
        .forEach(item => {
            item.classList.remove("active");
        });


    perfilAlumnoButton.classList.add("active");


    contentArea.innerHTML = `

        <div class="student-content-placeholder">

            <h2>
                Mi perfil
            </h2>

        </div>

    `;

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