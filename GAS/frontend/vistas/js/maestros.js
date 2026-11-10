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

    const lista = document.getElementById("committeeListBody");
    const detalles = document.getElementById("committeeDetails");
    const buscador = document.getElementById("committeeSearch");
    const botonCompleto = document.getElementById("committeeFullButton");
    const historial = document.querySelector(".committee-history-table tbody");
    let comites = [];
    let comiteSeleccionado = null;
    let profesores = null;
    botonCompleto.disabled = true;

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
                <strong>${comite.identificador || `Comité ${comite.id}`}</strong>
                <span class="committee-status ${
                    comite.estado === "Activo" ? "status-active" : "status-finished"
                }">${comite.estado}</span>
            </div>
            <p><strong>Tesista:</strong> ${comite.tesista || "—"}</p>
            <p><strong>Matrícula:</strong> ${comite.matricula}</p>
        `;
        botonCompleto.disabled = false;
    }

    function mostrarComites(filtro = "") {
        const termino = filtro.trim().toLowerCase();

        const filtrados = comites.filter(comite =>
            `${comite.identificador} ${comite.matricula} ${comite.tesista} ${comite.estado}`
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
                <td>${comite.identificador || `Comité ${comite.id}`}</td>
                <td>${comite.matricula || "—"}</td>
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
                cargarHistorial(comite.id);
            });

            fila.addEventListener("click", evento => {
                if (evento.target.tagName !== "INPUT") {
                    comiteSeleccionado = comite.id;
                    mostrarComites(buscador.value);
                    mostrarDetalles(comite);
                    cargarHistorial(comite.id);
                }
            });

            lista.appendChild(fila);
        });
    }

    function pintarHistorial(cambios) {
        historial.replaceChildren();
        if (!cambios.length) {
            const fila = document.createElement("tr");
            fila.innerHTML = '<td colspan="6" class="committee-empty">No hay cambios registrados.</td>';
            historial.append(fila);
            return;
        }
        cambios.forEach(cambio => {
            const fila = document.createElement("tr");
            [
                new Date(cambio.fecha).toLocaleString(),
                cambio.accion,
                cambio.integranteNuevo || cambio.integranteAnterior || "—",
                cambio.rolAnterior || "—",
                cambio.rolNuevo || "—",
                cambio.realizadoPor || "—"
            ].forEach(valor => {
                const celda = document.createElement("td");
                celda.textContent = valor;
                fila.append(celda);
            });
            historial.append(fila);
        });
    }

    async function cargarHistorial(id) {
        try {
            pintarHistorial(await gasApi(`/api/comites/${id}/historial`));
        } catch (error) {
            pintarHistorial([]);
            const mensaje = historial.querySelector(".committee-empty");
            if (mensaje) mensaje.textContent = error.message;
        }
    }

    function pintarInformacionCompleta(comite) {
        detalles.replaceChildren();
        const titulo = document.createElement("h4");
        titulo.textContent = comite.identificador || `Comité ${comite.id}`;
        const resumen = document.createElement("p");
        resumen.textContent = `Tesis #${comite.tesisId} · Tesista: ${comite.tesista || "—"} · Matrícula: ${comite.matricula} · Estado: ${comite.estado}`;
        const listaIntegrantes = document.createElement("ul");
        comite.integrantes.forEach(integrante => {
            const elemento = document.createElement("li");
            elemento.textContent = `${integrante.rol}: ${integrante.nombre} (RPE ${integrante.rpe})`;
            listaIntegrantes.append(elemento);
        });
        detalles.append(titulo, resumen, listaIntegrantes);

        if (comite.puedeModificar) {
            const modificar = document.createElement("button");
            modificar.type = "button";
            modificar.className = "committee-full-button";
            modificar.textContent = "Modificar integrantes";
            modificar.addEventListener("click", () => mostrarFormularioEdicion(comite));
            detalles.append(modificar);
        }
    }

    async function mostrarFormularioEdicion(comite) {
        if (!profesores) profesores = await gasApi("/api/comites/profesores");
        const opcion = (valor, vacio) => {
            const select = document.createElement("select");
            const inicial = new Option(vacio, "");
            select.append(inicial);
            profesores.forEach(profesor => {
                const item = new Option(`${profesor.nombre} (RPE ${profesor.rpe})`, profesor.rpe);
                item.selected = profesor.rpe === valor;
                select.append(item);
            });
            return select;
        };
        const actuales = comite.integrantes;
        const director = actuales.find(i => i.rol === "Director");
        const codirector = actuales.find(i => i.rol === "Codirector");
        const sinodales = actuales.filter(i => i.rol === "Asesor");
        detalles.replaceChildren();
        const titulo = document.createElement("h4");
        titulo.textContent = "Modificar integrantes";
        const formulario = document.createElement("form");
        formulario.className = "committee-info-grid";
        const campos = [
            ["Director", opcion(director?.rpe, "Seleccionar director")],
            ["Codirector", opcion(codirector?.rpe, "Sin codirector")],
            ["Sinodal 1", opcion(sinodales[0]?.rpe, "Seleccionar sinodal")],
            ["Sinodal 2", opcion(sinodales[1]?.rpe, "Sin sinodal")],
            ["Sinodal 3", opcion(sinodales[2]?.rpe, "Sin sinodal")]
        ];
        campos.forEach(([etiqueta, select]) => {
            const label = document.createElement("label");
            label.textContent = etiqueta;
            label.append(select);
            formulario.append(label);
        });
        const mensaje = document.createElement("p");
        const guardar = document.createElement("button");
        guardar.type = "submit";
        guardar.className = "committee-full-button";
        guardar.textContent = "Guardar integrantes";
        formulario.append(mensaje, guardar);
        formulario.addEventListener("submit", async event => {
            event.preventDefault();
            const valores = [...formulario.querySelectorAll("select")].map(select => select.value);
            const sinodales = valores.slice(2).filter(Boolean).map(Number);
            const datos = {
                directorRpe: Number(valores[0]),
                codirectorRpe: valores[1] ? Number(valores[1]) : null,
                sinodalesRpe: sinodales
            };
            if (!datos.directorRpe || !sinodales.length ||
                new Set([datos.directorRpe, datos.codirectorRpe, ...sinodales].filter(Boolean)).size !==
                2 + sinodales.length - (datos.codirectorRpe ? 0 : 1)) {
                mensaje.textContent = "Selecciona un director, al menos un sinodal y profesores distintos.";
                return;
            }
            guardar.disabled = true;
            try {
                await gasApi(`/api/comites/${comite.id}/integrantes`, "PUT", datos);
                await cargarComites();
            } catch (error) {
                mensaje.textContent = error.message;
                guardar.disabled = false;
            }
        });
        detalles.append(titulo, formulario);
    }

    async function cargarComites() {
        try {
            const respuesta = await gasApi(`/api/comites/mios?buscar=${encodeURIComponent(buscador.value.trim())}`);
            comites = respuesta.comites;
            mostrarComites();
            if (comiteSeleccionado) {
                const actualizado = comites.find(comite => comite.id === comiteSeleccionado);
                if (actualizado) {
                    mostrarDetalles(actualizado);
                    await cargarHistorial(actualizado.id);
                    return;
                }
            }
            mostrarDetalles(null);
            pintarHistorial([]);
        } catch (error) {
            lista.innerHTML = `<tr><td colspan="4" class="committee-empty">${error.message}</td></tr>`;
            mostrarDetalles(null);
            pintarHistorial([]);
        }
    }

    buscador.addEventListener("input", () => {
        mostrarComites(buscador.value);
    });

    botonCompleto.addEventListener("click", async () => {
        const comite = comites.find(item => item.id === comiteSeleccionado);
        if (comite) pintarInformacionCompleta(comite);
    });

    gasSession.then(async () => {
        await cargarComites();
    }).catch(error => {
        lista.innerHTML = `<tr><td colspan="4" class="committee-empty">${error.message}</td></tr>`;
    });
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
    limpiarSeleccion();
    evaluacionTesisButton.classList.add("active");
    mostrarAvancesPendientes();
});

function mostrarAvancesPendientes() {
    contentArea.innerHTML = `
        <section class="thesis-review-page">
            <header class="thesis-review-header">
                <div class="thesis-review-heading-icon"></div>
                <div>
                    <h2>Revisión de Tesis</h2>
                    <p>Consulta los avances de tesis que requieren revisión y selecciona una para continuar.</p>
                </div>
            </header>

            <div class="teacher-info thesis-review-notice">
                <span class="thesis-review-info-icon">i</span>
                <p>Tienes 3 avances de tesis pendientes por revisar.</p>
            </div>

            <section class="thesis-review-card">
                <h3><span></span> Avances de Tesis Pendientes</h3>
                <div class="thesis-review-table-wrapper">
                    <table class="thesis-review-table">
                        <thead>
                            <tr>
                                <th>Nombre de la Tesis</th>
                                <th>Tesista</th>
                                <th>Generación</th>
                                <th>Fecha de Envío</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td><span class="thesis-document-icon"></span><strong>Optimización del uso del agua<br>en zonas urbanas</strong></td>
                                <td>María González López</td>
                                <td>2025</td>
                                <td>06/11/2025</td>
                                <td><button type="button" class="teacher-button thesis-review-button" data-review="urbanas">⌕ &nbsp; Revisar</button></td>
                            </tr>
                            <tr>
                                <td><span class="thesis-document-icon"></span><strong>Análisis de la calidad del agua<br>en la región Huasteca</strong></td>
                                <td>Carlos Mendoza Ramírez</td>
                                <td>2025</td>
                                <td>05/11/2025</td>
                                <td><button type="button" class="teacher-button thesis-review-button" data-review="huasteca">⌕ &nbsp; Revisar</button></td>
                            </tr>
                            <tr>
                                <td><span class="thesis-document-icon"></span><strong>Modelado hidrológico para<br>el monitoreo de cuencas</strong></td>
                                <td>Ana Torres Pérez</td>
                                <td>2025</td>
                                <td>03/11/2025</td>
                                <td><button type="button" class="teacher-button thesis-review-button" data-review="cuencas">⌕ &nbsp; Revisar</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p class="thesis-review-footer"><span>ⓘ</span> Selecciona una tesis para ver su evaluación y continuar con la revisión.</p>
            </section>
        </section>`;

    contentArea.querySelectorAll(".thesis-review-button").forEach(button => {
        button.addEventListener("click", () => mostrarRegistroEvaluacion(button.dataset.review));
    });
}

function mostrarRegistroEvaluacion(tipo) {
    const datos = {
        urbanas: {
            tesista: "María González López",
            tesis: "Optimización del uso del agua en zonas urbanas"
        },
        huasteca: {
            tesista: "Carlos Mendoza Ramírez",
            tesis: "Análisis de la calidad del agua en la región Huasteca"
        },
        cuencas: {
            tesista: "Ana Torres Pérez",
            tesis: "Modelado hidrológico para el monitoreo de cuencas"
        }
    }[tipo] || {
        tesista: "Juan Pérez Martínez",
        tesis: "Evaluación de la eficiencia de humedales construidos"
    };

    contentArea.innerHTML = `
        <section class="evaluation-record-page">
            <header class="evaluation-record-header">
                <h2>Registro de evaluación</h2>
                <p>El sistema te permite registrar la evaluación del avance de tesis del tesista asignado.</p>
                <p>Los datos generales se muestran a continuación y no pueden ser modificados.</p>
            </header>

            <div class="teacher-info evaluation-record-notice">
                <span>ⓘ</span>
                <p>Completa los campos requeridos para registrar la evaluación.</p>
            </div>

            <section class="evaluation-record-card">
                <h3>Información de la evaluación <small>(establecida por el sistema)</small></h3>
                <div class="evaluation-system-grid">
                    <label>Identificador de evaluación<input value="EV-2024-00123" readonly></label>
                    <label>Tesista asociado<input value="${datos.tesista}" readonly></label>
                    <label class="evaluation-thesis-field">Tesis evaluada<div class="evaluation-thesis-value"><span>${datos.tesis}</span><button type="button" class="teacher-button secondary">▧ &nbsp; Abrir tesis</button></div></label>
                    <label>Profesor evaluador<input value="Dr. Luis Fernando González" readonly></label>
                    <label>Fecha de evaluación<input value="15/04/2025" readonly></label>
                </div>
            </section>

            <section class="evaluation-record-card">
                <h3>Evaluación</h3>
                <div class="evaluation-form-grid">
                    <label>Porcentaje de avance <span class="required-mark">*</span><div class="evaluation-percent-field"><input type="number" min="0" max="100" placeholder="Ej. 65"><span>%</span></div></label>
                    <label>Estado de evaluación <span class="required-mark">*</span><select><option value="">Selecciona estado</option><option>En revisión</option><option>Aprobado</option><option>Con correcciones</option></select></label>
                    <label class="evaluation-comments-field">Comentarios generales <span class="required-mark">*</span><textarea rows="4" placeholder="Escribe aquí tus comentarios y observaciones generales sobre el avance de la tesis..."></textarea></label>
                </div>
            </section>

            <div class="evaluation-record-actions">
                <button type="button" class="teacher-button secondary" id="cancelEvaluationButton">Cancelar</button>
                <button type="button" class="teacher-button" id="saveEvaluationButton">▣ &nbsp; Guardar evaluación</button>
            </div>
            <p class="evaluation-save-notice" id="evaluationSaveNotice" role="status"></p>
        </section>`;

    document.getElementById("cancelEvaluationButton").addEventListener("click", mostrarAvancesPendientes);
    document.getElementById("saveEvaluationButton").addEventListener("click", () => {
        document.getElementById("evaluationSaveNotice").textContent =
            "Vista previa: la evaluación está lista para guardarse.";
    });
}


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