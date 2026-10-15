// ==================================================
// PANEL DEL MAESTRO
// ==================================================


// ==================================================
// ELEMENTOS DEL MENÚ
// ==================================================

const inicioMaestroButton = document.getElementById("inicioMaestroButton");
const informacionMaestroButton = document.getElementById("informacionMaestroButton");

const tesisMenu = document.getElementById("tesisMenu");
const tesisSubmenu = document.getElementById("tesisSubmenu");
const tesisArrow = document.getElementById("tesisArrow");
const consultaTesisButton = document.getElementById("consultaTesisButton");

const comiteTutorialMenu = document.getElementById("comiteTutorialMenu");
const comiteTutorialSubmenu = document.getElementById("comiteTutorialSubmenu");
const comiteTutorialArrow = document.getElementById("comiteTutorialArrow");
const gestionComiteButton = document.getElementById("gestionComiteButton");
////const historialCambiosButton = document.getElementById("historialCambiosButton");

const evaluacionesMenu = document.getElementById("evaluacionesMenu");
const evaluacionesSubmenu = document.getElementById("evaluacionesSubmenu");
const evaluacionesArrow = document.getElementById("evaluacionesArrow");
const evaluacionTesisButton = document.getElementById("evaluacionTesisButton");

const documentosMaestroButton = document.getElementById("documentosMaestroButton");
const mensajesMaestroButton = document.getElementById("mensajesMaestroButton");
const ayudaMaestroButton = document.getElementById("ayudaMaestroButton");
const cerrarSesionMaestroButton = document.getElementById("cerrarSesionMaestroButton");

const contentArea = document.getElementById("contentArea");


// ==================================================
// FUNCIONES GENERALES
// ==================================================

// Quitar la selección anterior del menú.

function limpiarSeleccion() {
    document.querySelectorAll(
        ".teacher-sidebar .sidebar-item, " +
        ".teacher-sidebar .sidebar-subitem"
    ).forEach(item => {
        item.classList.remove("active");
    });
}


// Mostrar una vista provisional.

function mostrarVista(titulo, descripcion = "") {
    contentArea.innerHTML = `
        <div class="teacher-view-placeholder">

            <h2>${titulo}</h2>

            ${descripcion ? `<p>${descripcion}</p>` : ""}

        </div>
    `;
}


// Seleccionar una opción y mostrar su vista.

function seleccionarVista(boton, titulo, descripcion = "") {
    limpiarSeleccion();
    boton.classList.add("active");

    mostrarVista(titulo, descripcion);
}


// Abrir o cerrar un submenú.

function alternarSubmenu(boton, submenu, flecha) {
    const estaAbierto = boton.getAttribute("aria-expanded") === "true";

    submenu.style.display = estaAbierto ? "none" : "flex";
    boton.setAttribute("aria-expanded", String(!estaAbierto));

    // La orientación visual de la flecha se actualiza mediante CSS.
    flecha.textContent = estaAbierto ? "⌄" : "⌃";
}


// ==================================================
// INICIO
// ==================================================

inicioMaestroButton.addEventListener("click", function () {
    limpiarSeleccion();
    inicioMaestroButton.classList.add("active");

    // El contenido queda vacío al seleccionar Inicio.
    contentArea.innerHTML = "";
});


// ==================================================
// MI INFORMACIÓN
// ==================================================

informacionMaestroButton.addEventListener("click", function () {
    seleccionarVista(
        informacionMaestroButton,
        "Mi información",
        "Aquí se mostrará la información personal y académica del maestro."
    );
});


// ==================================================
// MENÚ TESIS
// ==================================================

tesisMenu.addEventListener("click", function () {
    alternarSubmenu(tesisMenu, tesisSubmenu, tesisArrow);
});


// CONSULTA DE TESIS

consultaTesisButton.addEventListener("click", function () {
    seleccionarVista(
        consultaTesisButton,
        "Consulta de tesis",
        "Aquí se mostrarán las tesis asignadas al maestro."
    );
});


// ==================================================
// MENÚ COMITÉ TUTORIAL
// ==================================================

comiteTutorialMenu.addEventListener("click", function () {
    alternarSubmenu(
        comiteTutorialMenu,
        comiteTutorialSubmenu,
        comiteTutorialArrow
    );
});


// ==================================================
// GESTIÓN DEL COMITÉ TUTORIAL
// ==================================================

gestionComiteButton.addEventListener("click", function () {
    limpiarSeleccion();
    gestionComiteButton.classList.add("active");

    contentArea.innerHTML = `
        <section class="committee-page">

            <h2 class="committee-page-title">
                Gestión del comité tutorial
            </h2>

            <!-- AVISO INFORMATIVO -->
            <div class="committee-notice">
                <span class="committee-notice-icon">ⓘ</span>

                <div>
                    <p>
                        El sistema permite agregar, reemplazar o remover
                        integrantes del comité tutorial.
                    </p>
                    <p>
                        Todas las modificaciones quedan reflejadas en el
                        comité activo y se conserva la trazabilidad de los cambios.
                    </p>
                </div>
            </div>

            <!-- COMITÉS E INFORMACIÓN -->
            <div class="committee-top-grid">

                <!-- LISTA DE COMITÉS -->
                <section class="committee-card committee-list-card">

                    <h3>♧ &nbsp; Comités a los que pertenece</h3>

                    <p class="committee-description">
                        Selecciona un comité para ver su información
                        y gestionar sus integrantes.
                    </p>

                    <div class="committee-search">
                        <span>⌕</span>
                        <input
                            type="search"
                            id="committeeSearch"
                            placeholder="Buscar comité por nombre o periodo..."
                        >
                    </div>

                    <div class="committee-table-wrapper">
                        <table class="committee-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Nombre del comité</th>
                                    <th>Periodo</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>

                            <tbody id="committeeListBody"></tbody>
                        </table>
                    </div>

                </section>

                <!-- INFORMACIÓN DEL COMITÉ -->
                <section class="committee-card committee-details-card">

                    <h3>♧ &nbsp; Información del comité seleccionado</h3>

                    <div id="committeeDetails">
                    </div>

                    <button
                        type="button"
                        class="committee-full-button"
                        id="committeeFullButton">
                        ▣ &nbsp; Ver información completa del comité ›
                    </button>

                </section>

            </div>

            <!-- HISTORIAL DE CAMBIOS -->
            <section class="committee-card committee-history-card">

                <h3>Historial de cambios</h3>

                <div class="committee-table-wrapper">
                    <table class="committee-table committee-history-table">

                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Acción</th>
                                <th>Integrante</th>
                                <th>Rol anterior</th>
                                <th>Rol nuevo</th>
                                <th>Realizado por</th>
                            </tr>
                        </thead>

                        <tbody></tbody>

                    </table>
                </div>

            </section>

            <!-- AVISO INFERIOR -->
            <div class="committee-bottom-notice">
                <span>ⓘ</span>
                Todas las modificaciones realizadas al comité tutorial
                quedan registradas para fines de control y seguimiento.
            </div>

        </section>
    `;

    inicializarVistaComite();
});


// ==================================================
// DATOS DEL COMITÉ
// ==================================================

function inicializarVistaComite() {

    const comites = [];

    const lista = document.getElementById("committeeListBody");
    const detalles = document.getElementById("committeeDetails");
    const buscador = document.getElementById("committeeSearch");
    const botonCompleto = document.getElementById("committeeFullButton");

    let comiteSeleccionado = null;

    function mostrarDetalles(comite) {
        if (!comite) {
            detalles.innerHTML = `
                <p class="committee-empty">
                    No hay información de comité disponible.
                </p>
            `;
            return;
        }

        detalles.innerHTML = `
            <div class="committee-selected-heading">
                <strong>${comite.nombre}</strong>
                <span class="committee-status ${
                    comite.estado === "Activo" ? "status-active" : "status-finished"
                }">${comite.estado}</span>
            </div>

            <div class="committee-info-grid">
                <div>
                    <p><strong>Rol en el Comité</strong></p>
                    <p>${comite.rol}</p>

                    <p><strong>Periodo</strong></p>
                    <p>${comite.periodo}</p>

                    <p><strong>Institución</strong></p>
                    <p>${comite.institucion}</p>
                </div>

                <div>
                    <p><strong>Presidente(a)</strong></p>
                    <p>${comite.presidente}</p>

                    <p><strong>Coordinador(a)</strong></p>
                    <p>${comite.coordinador}</p>

                    <p><strong>Descripción</strong></p>
                    <p>${comite.descripcion}</p>
                </div>
            </div>
        `;
    }

    function mostrarComites(filtro = "") {
        const termino = filtro.trim().toLowerCase();

        const filtrados = comites.filter(comite =>
            `${comite.nombre} ${comite.periodo} ${comite.estado}`
                .toLowerCase()
                .includes(termino)
        );

        lista.innerHTML = "";

        if (filtrados.length === 0) {
            lista.innerHTML = `
                <tr>
                    <td colspan="4" class="committee-empty">
                        No se encontraron comités.
                    </td>
                </tr>
            `;
            return;
        }

        filtrados.forEach(comite => {
            const fila = document.createElement("tr");

            if (comite.id === comiteSeleccionado) {
                fila.classList.add("selected-committee-row");
            }

            fila.innerHTML = `
                <td>
                    <input
                        type="radio"
                        name="selectedCommittee"
                        aria-label="Seleccionar comité"
                        ${comite.id === comiteSeleccionado ? "checked" : ""}
                    >
                </td>
                <td>${comite.nombre}</td>
                <td>${comite.periodo}</td>
                <td>
                    <span class="committee-status ${
                        comite.estado === "Activo" ? "status-active" : "status-finished"
                    }">${comite.estado}</span>
                </td>
            `;

            fila.querySelector("input").addEventListener("change", () => {
                comiteSeleccionado = comite.id;
                mostrarComites(buscador.value);
                mostrarDetalles(comite);
            });

            fila.addEventListener("click", evento => {
                if (evento.target.tagName !== "INPUT") {
                    comiteSeleccionado = comite.id;
                    mostrarComites(buscador.value);
                    mostrarDetalles(comite);
                }
            });

            lista.appendChild(fila);
        });
    }

    buscador.addEventListener("input", () => {
        mostrarComites(buscador.value);
    });

    botonCompleto.addEventListener("click", () => {
        const comite = comites.find(item => item.id === comiteSeleccionado);

        mostrarVista(
            "Información completa del comité",
            comite
                ? `${comite.nombre} · Periodo ${comite.periodo}. Esta vista se desarrollará posteriormente.`
                : "Selecciona un comité para consultar su información."
        );
    });

    mostrarComites();
    mostrarDetalles(comites[0]);
}





// ==================================================
// MENÚ EVALUACIONES
// ==================================================

evaluacionesMenu.addEventListener("click", function () {
    alternarSubmenu(
        evaluacionesMenu,
        evaluacionesSubmenu,
        evaluacionesArrow
    );
});


// EVALUACIÓN DE TESIS

evaluacionTesisButton.addEventListener("click", function () {
    seleccionarVista(
        evaluacionTesisButton,
        "Evaluación de tesis",
        "Aquí se mostrará la vista para consultar las tesis y sus evaluaciones."
    );
});


// ==================================================
// DOCUMENTOS
// ==================================================

documentosMaestroButton.addEventListener("click", function () {
    seleccionarVista(
        documentosMaestroButton,
        "Documentos",
        "Aquí se mostrarán los documentos disponibles para el maestro."
    );
});


// ==================================================
// MENSAJES
// ==================================================

mensajesMaestroButton.addEventListener("click", function () {
    seleccionarVista(
        mensajesMaestroButton,
        "Mensajes",
        "Aquí se mostrarán los mensajes y notificaciones del sistema."
    );
});


// ==================================================
// AYUDA
// ==================================================

ayudaMaestroButton.addEventListener("click", function () {
    seleccionarVista(
        ayudaMaestroButton,
        "Ayuda",
        "Aquí se mostrará la información de ayuda para el maestro."
    );
});


// ==================================================
// CERRAR SESIÓN
// ==================================================

cerrarSesionMaestroButton.addEventListener("click", function () {
    // Por ahora, el botón es únicamente visual.
    console.log("Cerrar sesión del maestro");
});


// ==================================================
// ESTADO INICIAL
// ==================================================

// Al entrar al panel no se muestra ninguna vista.
// El contenido principal comienza completamente vacío.

contentArea.innerHTML = "";