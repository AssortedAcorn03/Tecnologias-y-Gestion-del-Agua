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
// COMITÉS TUTORIALES
// ==================================================

const comitesTutorialesMenu =
    document.getElementById("comitesTutorialesMenu");
const comitesTutorialesSubmenu =
    document.getElementById("comitesTutorialesSubmenu");
const comitesTutorialesArrow =
    document.getElementById("comitesTutorialesArrow");
const altaComiteButton =
    document.getElementById("altaComiteButton");
const gestionComitesButton =
    document.getElementById("gestionComitesButton");

// ==================================================
// EGRESADOS
// ==================================================

const egresadosMenu = document.getElementById("egresadosMenu");
const egresadosSubmenu = document.getElementById("egresadosSubmenu");
const egresadosArrow = document.getElementById("egresadosArrow");
const registrarEgresadoButton = document.getElementById("registrarEgresadoButton");
const consultarEgresadoButton = document.getElementById("consultarEgresadoButton");
const longitudinalidadButton = document.getElementById("longitudinalidadButton");
const contentArea = document.getElementById("contentArea");

// ==================================================
// MENÚ COMITÉS TUTORIALES
// ==================================================

comitesTutorialesMenu.addEventListener("click", function () {

    const submenuVisible =
        comitesTutorialesSubmenu.style.display !== "none";

    comitesTutorialesSubmenu.style.display =
        submenuVisible ? "none" : "flex";
    comitesTutorialesArrow.textContent =
        submenuVisible ? "⌄" : "⌃";

});

// ==================================================
// ALTA DE COMITÉ
// ==================================================

altaComiteButton.addEventListener("click", function (event) {

    event.stopPropagation();
    mostrarAltaComite();

});

function mostrarAltaComite() {

    contentArea.innerHTML = `

        <section class="coordinator-committee-form-page">

            <div class="coordinator-committee-form-header">
                <h2>Nuevo comité tutorial</h2>
                <button
                    type="button"
                    class="coordinator-committee-back-button"
                    id="backToCommitteesButton">
                    ← &nbsp; Volver a comités tutoriales
                </button>
            </div>

            <div class="coordinator-committee-form-notice">
                <span>ⓘ</span>
                <p>
                    Completa la información del nuevo comité tutorial.
                    Los campos marcados con <strong>*</strong> son obligatorios.
                </p>
            </div>

            <section class="coordinator-committee-form-card">

                <h3>Datos del comité tutorial</h3>

                <div class="coordinator-committee-form-grid">

                    <div class="coordinator-committee-form-group">
                        <label for="committeeIdentifier">
                            Identificador del comité <span>*</span>
                        </label>
                        <input
                            id="committeeIdentifier"
                            type="text"
                            placeholder="Ej. CT-2024-001">
                    </div>

                    <div class="coordinator-committee-form-group">
                        <label for="thesisKey">
                            Matrícula del tesista <span>*</span>
                        </label>
                        <input
                            id="thesisKey"
                            type="text"
                            inputmode="numeric"
                            placeholder="Ej. 300103">
                    </div>

                    <div class="coordinator-committee-form-group">
                        <label for="committeeDirector">
                            Director <span>*</span>
                        </label>
                        <select id="committeeDirector">
                            <option value="">Seleccionar director</option>
                        </select>
                    </div>

                    <div class="coordinator-committee-form-group">
                        <label for="committeeCoDirector">
                            Codirector
                        </label>
                        <select id="committeeCoDirector">
                            <option value="">Seleccionar codirector</option>
                        </select>
                    </div>

                    <div class="coordinator-committee-form-group coordinator-committee-synodals-number">
                        <label for="synodalsNumber">
                            Número de sinodales <span>*</span>
                        </label>
                        <small>
                            Selecciona cuántos sinodales formarán parte del comité (máximo 3).
                        </small>
                        <select id="synodalsNumber">
                            <option value="">Seleccionar número</option>
                            <option value="1">1 sinodal</option>
                            <option value="2">2 sinodales</option>
                            <option value="3">3 sinodales</option>
                        </select>
                    </div>

                </div>

                <div class="coordinator-committee-synodals">
                    <div class="coordinator-committee-form-group">
                        <label for="synodalOne">
                            Sinodal 1 <span>*</span>
                        </label>
                        <select id="synodalOne" disabled>
                            <option value="">Seleccionar sinodal 1</option>
                        </select>
                    </div>

                    <div class="coordinator-committee-form-group">
                        <label for="synodalTwo">Sinodal 2</label>
                        <select id="synodalTwo" disabled>
                            <option value="">Seleccionar sinodal 2</option>
                        </select>
                    </div>

                    <div class="coordinator-committee-form-group">
                        <label for="synodalThree">Sinodal 3</label>
                        <select id="synodalThree" disabled>
                            <option value="">Seleccionar sinodal 3</option>
                        </select>
                    </div>

                    <div class="coordinator-committee-synodals-notice">
                        <span>ⓘ</span>
                        Los campos de sinodales se habilitan de acuerdo al número seleccionado.
                    </div>
                </div>

                <div class="coordinator-committee-form-group coordinator-committee-date">
                    <label for="committeeDate">
                        Fecha <span>*</span>
                    </label>
                    <input id="committeeDate" type="date">
                </div>

            </section>

            <div class="coordinator-committee-form-actions">
                <button
                    type="button"
                    class="coordinator-committee-cancel-button"
                    id="cancelCommitteeButton">
                    Cancelar
                </button>
                <button
                    type="button"
                    class="coordinator-committee-save-button">
                    ▣ &nbsp; Guardar comité
                </button>
            </div>

        </section>

    `;

    activarSubmenuComites(altaComiteButton);

    const mensajeComite = document.createElement("p");
    mensajeComite.id = "committeeFormMessage";
    mensajeComite.setAttribute("role", "status");
    mensajeComite.className = "error";
    document.querySelector(".coordinator-committee-form-actions").before(mensajeComite);

    const selectsProfesores = [
        document.getElementById("committeeDirector"),
        document.getElementById("committeeCoDirector"),
        document.getElementById("synodalOne"),
        document.getElementById("synodalTwo"),
        document.getElementById("synodalThree")
    ];
    gasApi("/api/comites/profesores")
        .then(profesores => {
            profesores.forEach(profesor => selectsProfesores.forEach(select => {
                select.append(new Option(`${profesor.nombre || "Sin nombre"} (RPE ${profesor.rpe})`, profesor.rpe));
            }));
        })
        .catch(error => { mensajeComite.textContent = error.message; });

    document
        .querySelector(".coordinator-committee-save-button")
        .addEventListener("click", async () => {
            const numeroSinodales = Number(document.getElementById("synodalsNumber").value);
            const sinodales = [
                document.getElementById("synodalOne").value,
                document.getElementById("synodalTwo").value,
                document.getElementById("synodalThree").value
            ].slice(0, numeroSinodales).map(Number);
            const datos = {
                identificador: document.getElementById("committeeIdentifier").value.trim(),
                claveTesista: document.getElementById("thesisKey").value.trim(),
                numeroSinodales,
                directorRpe: Number(document.getElementById("committeeDirector").value),
                codirectorRpe: document.getElementById("committeeCoDirector").value
                    ? Number(document.getElementById("committeeCoDirector").value) : null,
                sinodalesRpe: sinodales,
                fecha: document.getElementById("committeeDate").value
            };
            if (!datos.identificador || !datos.claveTesista || !datos.numeroSinodales ||
                !datos.directorRpe || sinodales.some(rpe => !rpe) || !datos.fecha) {
                mensajeComite.textContent = "Completa todos los campos obligatorios.";
                return;
            }

            const boton = document.querySelector(".coordinator-committee-save-button");
            boton.disabled = true;
            mensajeComite.textContent = "Guardando comité...";
            try {
                const respuesta = await gasApi("/api/comites", "POST", datos);
                mensajeComite.textContent = respuesta.mensaje;
                boton.disabled = true;
            } catch (error) {
                mensajeComite.textContent = error.message;
                boton.disabled = false;
            }
        });

    document
        .getElementById("backToCommitteesButton")
        .addEventListener("click", mostrarGestionComites);

    document
        .getElementById("cancelCommitteeButton")
        .addEventListener("click", mostrarGestionComites);

    document
        .getElementById("synodalsNumber")
        .addEventListener("change", function (event) {
            const selectedNumber = Number(event.target.value);
            const synodalFields = [
                document.getElementById("synodalOne"),
                document.getElementById("synodalTwo"),
                document.getElementById("synodalThree")
            ];

            synodalFields.forEach((field, index) => {
                field.disabled = index >= selectedNumber;
                if (field.disabled) {
                    field.value = "";
                }
            });
        });

}

// ==================================================
// GESTIÓN DE COMITÉS
// ==================================================

gestionComitesButton.addEventListener("click", function (event) {

    event.stopPropagation();
    mostrarGestionComites();

});

function mostrarGestionComites() {

    contentArea.innerHTML = `

        <section class="coordinator-committee-page">

            <div class="coordinator-committee-notice">
                <span>ⓘ</span>
                <div>
                    <p>
                        El sistema permite agregar, reemplazar o remover
                        integrantes del comité tutorial.
                    </p>
                    <p>
                        Todas las modificaciones quedan reflejadas en el comité
                        activo y se conserva la trazabilidad de los cambios.
                    </p>
                </div>
            </div>

            <div class="coordinator-committee-top-grid">

                <section class="coordinator-committee-card">

                    <h3>♧ &nbsp; Comités registrados</h3>

                    <p class="coordinator-committee-description">
                        Selecciona un comité para consultar su información
                        y gestionar sus integrantes.
                    </p>

                    <div class="coordinator-committee-search">
                        <span>⌕</span>
                        <input
                            type="search"
                            id="committeeSearch"
                            placeholder="Buscar comité por nombre o periodo..."
                        >
                    </div>

                    <div class="coordinator-committee-table-wrapper">
                        <table class="coordinator-committee-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>Nombre del comité</th>
                                    <th>Periodo</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody id="committeeRows">
                                <tr>
                                    <td colspan="4" class="coordinator-committee-empty">
                                        No hay comités registrados.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </section>

                <section class="coordinator-committee-card">

                    <h3>♧ &nbsp; Información del comité seleccionado</h3>

                    <div class="coordinator-committee-details" id="committeeDetails">
                        <p class="coordinator-committee-empty">
                            Selecciona un comité para consultar su información.
                        </p>
                    </div>

                    <button
                        type="button"
                        class="coordinator-committee-full-button"
                        id="committeeEditButton"
                        disabled>
                        ▣ &nbsp; Ver información completa del comité ›
                    </button>
                </section>

            </div>

            <section class="coordinator-committee-card coordinator-committee-history">

                <h3>Historial de cambios</h3>

                <div class="coordinator-committee-table-wrapper">
                    <table class="coordinator-committee-table">
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
                        <tbody id="committeeHistoryRows">
                            <tr>
                                <td colspan="6" class="coordinator-committee-empty">
                                    No hay cambios registrados.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </section>

            <div class="coordinator-committee-bottom-notice">
                <span>ⓘ</span>
                Todas las modificaciones realizadas al comité tutorial
                quedarán registradas para fines de control y seguimiento.
            </div>

        </section>

    `;

    activarSubmenuComites(gestionComitesButton);

    const filas = document.getElementById("committeeRows");
    const detalles = document.getElementById("committeeDetails");
    const buscador = document.getElementById("committeeSearch");
    const editar = document.getElementById("committeeEditButton");
    let comites = [];
    let seleccionado = null;
    let profesores = [];

    function celda(texto) {
        const td = document.createElement("td");
        td.textContent = texto || "—";
        return td;
    }

    function pintarDetalle(comite) {
        seleccionado = comite;
        detalles.replaceChildren();
        const titulo = document.createElement("h4");
        titulo.textContent = comite.identificador || `Comité ${comite.id}`;
        const info = document.createElement("p");
        info.textContent = `Tesista: ${comite.tesista || "—"} · Matrícula: ${comite.matricula}`;
        const integrantes = document.createElement("ul");
        comite.integrantes.forEach(integrante => {
            const li = document.createElement("li");
            li.textContent = `${integrante.rol}: ${integrante.nombre} (RPE ${integrante.rpe})`;
            integrantes.append(li);
        });
        detalles.append(titulo, info, integrantes);
        editar.disabled = false;
    }

    function pintarTabla(lista) {
        filas.replaceChildren();
        if (!lista.length) {
            const row = document.createElement("tr");
            const empty = document.createElement("td");
            empty.colSpan = 4;
            empty.className = "coordinator-committee-empty";
            empty.textContent = "No hay comités registrados.";
            row.append(empty);
            filas.append(row);
            return;
        }
        lista.forEach(comite => {
            const row = document.createElement("tr");
            const selector = document.createElement("td");
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = "Seleccionar";
            button.addEventListener("click", () => pintarDetalle(comite));
            selector.append(button);
            row.append(selector, celda(comite.identificador || `Comité ${comite.id}`),
                celda(comite.matricula), celda(comite.estado));
            filas.append(row);
        });
    }

    async function cargarComites() {
        try {
            const termino = buscador.value.trim();
            const respuesta = await gasApi("/api/comites" +
                (termino ? `?buscar=${encodeURIComponent(termino)}` : ""));
            comites = respuesta.comites;
            pintarTabla(comites);
        } catch (error) {
            filas.replaceChildren();
            const row = document.createElement("tr");
            const empty = document.createElement("td");
            empty.colSpan = 4;
            empty.className = "coordinator-committee-empty";
            empty.textContent = error.message;
            row.append(empty);
            filas.append(row);
        }
    }

    async function editarIntegrantes() {
        if (!seleccionado) return;
        if (!profesores.length) profesores = await gasApi("/api/comites/profesores");
        const escapar = valor => String(valor ?? "").replace(/[&<>"']/g, caracter => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[caracter]));
        const activo = seleccionado.integrantes.filter(i => i.rol === "Director" ||
            i.rol === "Codirector" || i.rol === "Asesor");
        const director = activo.find(i => i.rol === "Director");
        const codirector = activo.find(i => i.rol === "Codirector");
        const sinodales = activo.filter(i => i.rol === "Asesor");
        const opciones = (valor, vacio) => `<option value="">${vacio}</option>` +
            profesores.map(p => `<option value="${p.rpe}" ${p.rpe === valor ? "selected" : ""}>${escapar(p.nombre || "Sin nombre")} (RPE ${p.rpe})</option>`).join("");
        detalles.innerHTML = `<h4>Gestionar integrantes</h4>
            <label>Director<select id="editCommitteeDirector">${opciones(director?.rpe, "Seleccionar director")}</select></label>
            <label>Codirector<select id="editCommitteeCoDirector">${opciones(codirector?.rpe, "Sin codirector")}</select></label>
            <label>Sinodal 1<select id="editCommitteeSynodal1">${opciones(sinodales[0]?.rpe, "Seleccionar sinodal")}</select></label>
            <label>Sinodal 2<select id="editCommitteeSynodal2">${opciones(sinodales[1]?.rpe, "Sin sinodal")}</select></label>
            <label>Sinodal 3<select id="editCommitteeSynodal3">${opciones(sinodales[2]?.rpe, "Sin sinodal")}</select></label>
            <p id="committeeEditMessage" role="status" class="error"></p>
            <button type="button" id="saveCommitteeMembers">Guardar integrantes</button>`;
        document.getElementById("saveCommitteeMembers").addEventListener("click", async event => {
            const value = id => document.getElementById(id).value;
            const sinodalesRpe = ["editCommitteeSynodal1", "editCommitteeSynodal2", "editCommitteeSynodal3"]
                .map(value).filter(Boolean).map(Number);
            const datos = {
                directorRpe: Number(value("editCommitteeDirector")),
                codirectorRpe: value("editCommitteeCoDirector") ? Number(value("editCommitteeCoDirector")) : null,
                sinodalesRpe
            };
            const mensaje = document.getElementById("committeeEditMessage");
            if (!datos.directorRpe || !sinodalesRpe.length) {
                mensaje.textContent = "Selecciona el director y al menos un sinodal.";
                return;
            }
            event.target.disabled = true;
            try {
                await gasApi(`/api/comites/${seleccionado.id}/integrantes`, "PUT", datos);
                await cargarComites();
                seleccionado = comites.find(c => c.id === seleccionado.id);
                pintarDetalle(seleccionado);
            } catch (error) {
                mensaje.textContent = error.message;
                event.target.disabled = false;
            }
        });
    }

    buscador.addEventListener("input", cargarComites);
    editar.addEventListener("click", () => editarIntegrantes().catch(error => {
        detalles.textContent = error.message;
    }));
    cargarComites();

}

function activarSubmenuComites(botonActivo) {

    altaComiteButton.classList.toggle(
        "active",
        botonActivo === altaComiteButton
    );
    gestionComitesButton.classList.toggle(
        "active",
        botonActivo === gestionComitesButton
    );

}

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
                            id="altaClaveAlumno"
                            placeholder="Ej. 201812345">

                    </div>


                    <div class="form-group">

                        <label>
                            Clave egresado
                            <span>*</span>
                        </label>

                        <input
                            type="text"
                            id="altaIdentificadorEgresado"
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
                            id="altaNombre"
                            placeholder="Ej. Juan">

                    </div>


                    <div class="form-group">

                        <label>
                            Apellido paterno
                            <span>*</span>
                        </label>

                        <input
                            type="text"
                            id="altaApellidoPaterno"
                            placeholder="Ej. Pérez">

                    </div>


                    <div class="form-group">

                        <label>
                            Apellido materno
                        </label>

                        <input
                            type="text"
                            id="altaApellidoMaterno"
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

                        <select id="altaGeneracion">

                            <option value="">
                                Seleccionar generación
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
                                    id="areaProfesionalEgresado"
                                    placeholder="Ej. Ingeniería y desarrollo"
                                    disabled>

                            </div>


                            <div class="form-group">

                                <label>
                                    Ubicación
                                </label>

                                <input
                                    type="text"
                                    id="ciudadEgresado"
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
                            id="correoEgresado"
                            placeholder="Ej. juan.perez@correo.com">

                    </div>


                    <div class="form-group">

                        <label>
                            Otro medio de contacto
                        </label>

                        <input
                            type="text"
                            id="telefonoEgresado"
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

            <p id="altaEgresadoMessage" role="status" class="error"></p>

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

        ["empresaEgresado", "areaProfesionalEgresado", "ciudadEgresado"]
            .forEach(id => { document.getElementById(id).disabled = !empleado.checked; });

    });

    const generaciones = document.getElementById("altaGeneracion");
    const mensaje = document.getElementById("altaEgresadoMessage");
    const guardar = document.querySelector(".graduate-save-button");
    const cancelar = document.querySelector(".graduate-cancel-button");

    gasApi("/api/generaciones")
        .then(lista => lista.forEach(g => generaciones.append(new Option(
            g.nombre || g.anioIngreso, g.id
        ))))
        .catch(error => { mensaje.textContent = error.message; });

    cancelar.addEventListener("click", () => mostrarConsultaEgresados());
    guardar.addEventListener("click", async () => {
        const data = {
            claveAlumno: Number(document.getElementById("altaClaveAlumno").value),
            identificadorEgresado: document.getElementById("altaIdentificadorEgresado").value.trim(),
            nombre: document.getElementById("altaNombre").value.trim(),
            apellidoPaterno: document.getElementById("altaApellidoPaterno").value.trim(),
            apellidoMaterno: document.getElementById("altaApellidoMaterno").value.trim() || null,
            generacionId: Number(generaciones.value),
            correo: document.getElementById("correoEgresado").value.trim(),
            telefono: document.getElementById("telefonoEgresado").value.trim() || null,
            empleado: empleado.checked,
            empresa: document.getElementById("empresaEgresado").value.trim() || null,
            areaProfesional: document.getElementById("areaProfesionalEgresado").value.trim() || null,
            ciudad: document.getElementById("ciudadEgresado").value.trim() || null
        };
        if (!data.claveAlumno || !data.identificadorEgresado || !data.nombre ||
            !data.apellidoPaterno || !data.generacionId || !data.correo) {
            mensaje.textContent = "Completa todos los campos obligatorios.";
            return;
        }
        guardar.disabled = true;
        mensaje.textContent = "Guardando egresado...";
        try {
            const respuesta = await gasApi("/api/egresados", "POST", data);
            mensaje.textContent = `${respuesta.mensaje} Contraseña inicial: ${respuesta.passwordInicial}`;
            guardar.disabled = true;
        } catch (error) {
            mensaje.textContent = error.message;
            guardar.disabled = false;
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
        cargarEgresados();

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
            cargarEgresados();

        });


    // ==================================================
    // BUSCAR
    // ==================================================

    document
        .getElementById("buscarEgresadosButton")
        .addEventListener("click", function () {
            cargarEgresados();

        });

    async function cargarEgresados() {
        const cuerpo = document.getElementById("egresadosTableBody");
        const total = document.getElementById("totalEgresados");
        const paginacion = document.getElementById("egresadosPaginationText");
        cuerpo.replaceChildren();
        paginacion.textContent = "Cargando egresados...";

        try {
            const nombre = document.getElementById("filtroNombreEgresado").value.trim();
            const identificador = document.getElementById("filtroIdentificadorEgresado").value.trim();
            const termino = nombre || identificador;
            const respuesta = await gasApi("/api/egresados" +
                (termino ? `?buscar=${encodeURIComponent(termino)}` : ""));
            let lista = respuesta.egresados;
            const estado = document.getElementById("filtroEstadoEgresado").value;
            const situacion = document.getElementById("filtroSituacionLaboral").value;

            if (estado === "activo") lista = lista.filter(e => e.localizable);
            if (estado === "inactivo") lista = lista.filter(e => !e.localizable);
            if (situacion === "con-trabajo") lista = lista.filter(e => e.situacionLaboral === "Con trabajo");
            if (situacion === "sin-trabajo") lista = lista.filter(e => e.situacionLaboral === "Sin trabajo");

            total.textContent = `Total de egresados: ${lista.length}`;
            paginacion.textContent = lista.length
                ? `Mostrando ${lista.length} egresado(s)`
                : "No hay registros para mostrar";

            for (const egresado of lista) {
                const fila = document.createElement("tr");
                const valores = [
                    egresado.identificador,
                    egresado.nombre,
                    egresado.generacion,
                    egresado.localizable ? "Localizable" : "No localizable",
                    egresado.situacionLaboral,
                    egresado.ultimaActualizacion
                        ? new Date(egresado.ultimaActualizacion).toLocaleDateString("es-MX")
                        : null
                ];
                valores.forEach(valor => {
                    const celda = document.createElement("td");
                    celda.textContent = valor || "—";
                    fila.append(celda);
                });

                const acciones = document.createElement("td");
                if (egresado.localizable && egresado.matricula) {
                    const boton = document.createElement("button");
                    boton.type = "button";
                    boton.textContent = "Marcar no localizable";
                    boton.addEventListener("click", async () => {
                        if (!confirm(`¿Marcar a ${egresado.nombre} como no localizable?`)) return;
                        boton.disabled = true;
                        try {
                            await gasApi(`/api/egresados/${egresado.matricula}/no-localizable`, "PUT");
                            await cargarEgresados();
                        } catch (error) {
                            alert(error.message);
                            boton.disabled = false;
                        }
                    });
                    acciones.append(boton);
                } else {
                    acciones.textContent = "Sin acciones";
                }
                fila.append(acciones);
                cuerpo.append(fila);
            }
        } catch (error) {
            total.textContent = "No fue posible cargar los egresados";
            paginacion.textContent = error.message;
        }
    }

    cargarEgresados();

}
// ==================================================
// LONGITUDINALIDAD DE EGRESADOS
// ==================================================




// ==================================================
// MOSTRAR VISTA DE LONGITUDINALIDAD
// ==================================================

if (longitudinalidadButton) {

    longitudinalidadButton.addEventListener("click", function () {

        // Quitar selección de las opciones del menú
        document.querySelectorAll(
            ".sidebar-item, .sidebar-subitem"
        ).forEach(item => {
            item.classList.remove("active");
        });

        // Activar la opción seleccionada
        longitudinalidadButton.classList.add("active");

        // Mostrar la vista
        contentArea.innerHTML = `

            <section class="longitudinal-page">

                <!-- ENCABEZADO -->
                <header class="longitudinal-header">

                    <h2>
                        Seguimiento longitudinal de egresados
                    </h2>

                    <p>
                        Permite consultar y dar seguimiento a la trayectoria
                        académica, laboral y de contacto de los egresados.
                    </p>

                </header>


                <!-- DISTRIBUCIÓN PRINCIPAL -->
                <div class="longitudinal-layout">


                    <!-- ==================================
                         COLUMNA IZQUIERDA
                         LISTADO DE EGRESADOS
                    =================================== -->

                    <section class="longitudinal-card">

                        <div class="longitudinal-section-title">

                            <span class="section-number">1</span>

                            <h3>
                                Selecciona un egresado
                            </h3>

                        </div>


                        <!-- BÚSQUEDA -->
                        <div class="longitudinal-search">

                            <input
                                type="search"
                                id="buscarEgresadoLongitudinal"
                                placeholder="Buscar por nombre, matrícula o generación..."
                                aria-label="Buscar egresado">

                        </div>


                        <!-- TABLA -->
                        <div class="longitudinal-table-wrapper">

                            <table class="longitudinal-table">

                                <thead>
                                    <tr>
                                        <th>Egresado</th>
                                        <th>Matrícula</th>
                                        <th>Generación</th>
                                        <th>Situación laboral</th>
                                        <th>Última actualización</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>

                                <tbody id="longitudinalResultados">

                                    <!--
                                        Los registros se agregarán
                                        cuando exista conexión
                                        con la base de datos.
                                    -->

                                </tbody>

                            </table>

                            <div
                                class="longitudinal-empty"
                                id="longitudinalEmpty">

                                No hay egresados para mostrar.

                            </div>

                        </div>


                        <!-- PAGINACIÓN VISUAL -->
                        <div class="longitudinal-pagination">

                            <span id="longitudinalTotal">
                                Mostrando 0 egresados
                            </span>

                            <div class="pagination-buttons">

                                <button type="button" disabled>
                                    ‹
                                </button>

                                <button
                                    type="button"
                                    class="pagination-current"
                                    disabled>
                                    1
                                </button>

                                <button type="button" disabled>
                                    ›
                                </button>

                            </div>

                        </div>

                    </section>



                    <!-- ==================================
                         COLUMNA DERECHA
                         DETALLES DEL EGRESADO
                    =================================== -->

                    <section class="longitudinal-card">

                        <!-- INFORMACIÓN GENERAL -->
                        <div class="longitudinal-section-title">

                            <span class="section-number">2</span>

                            <h3>
                                Información del egresado seleccionado
                            </h3>

                        </div>


                        <div
                            class="longitudinal-profile"
                            id="longitudinalProfile">

                            <div class="longitudinal-avatar">
                                <!-- Espacio para el icono -->
                            </div>

                            <div class="longitudinal-profile-info">

                                <h3>
                                    Ningún egresado seleccionado
                                </h3>

                                <p>
                                    Selecciona un egresado de la tabla
                                    para consultar su información.
                                </p>

                            </div>

                        </div>


                        <!-- HISTORIAL LABORAL -->
                        <details
                            class="longitudinal-accordion"
                            open>

                            <summary>

                                <span class="section-number">1</span>

                                <span>
                                    Historial laboral
                                </span>

                            </summary>

                            <div class="longitudinal-accordion-content">

                                <div class="longitudinal-table-wrapper">

                                    <table class="longitudinal-table">

                                        <thead>
                                            <tr>
                                                <th>Periodo</th>
                                                <th>Empresa / Institución</th>
                                                <th>Puesto</th>
                                                <th>Área</th>
                                                <th>Tipo de empleo</th>
                                            </tr>
                                        </thead>

                                        <tbody id="longitudinalHistorialLaboral">

                                        </tbody>

                                    </table>

                                </div>

                                <p class="longitudinal-detail-empty">
                                    Sin información laboral para mostrar.
                                </p>

                            </div>

                        </details>


                        <!-- SITUACIÓN LABORAL -->
                        <details class="longitudinal-accordion">

                            <summary>

                                <span class="section-number">2</span>

                                <span>
                                    Situación laboral
                                </span>

                            </summary>

                            <div class="longitudinal-accordion-content">

                                <p>
                                    Selecciona un egresado para consultar
                                    su situación laboral.
                                </p>

                            </div>

                        </details>


                        <!-- ÚLTIMA ACTUALIZACIÓN -->
                        <details class="longitudinal-accordion">

                            <summary>

                                <span class="section-number">3</span>

                                <span>
                                    Última actualización
                                </span>

                            </summary>

                            <div class="longitudinal-accordion-content">

                                <p>
                                    No hay información disponible.
                                </p>

                            </div>

                        </details>


                        <!-- RETROALIMENTACIÓN -->
                        <details class="longitudinal-accordion">

                            <summary>

                                <span class="section-number">4</span>

                                <span>
                                    Retroalimentación
                                </span>

                            </summary>

                            <div class="longitudinal-accordion-content">

                                <p>
                                    No hay retroalimentación disponible.
                                </p>

                            </div>

                        </details>


                        <!-- INTENTOS DE CONTACTO -->
                        <details class="longitudinal-accordion">

                            <summary>

                                <span class="section-number">5</span>

                                <span>
                                    Intentos de contacto
                                </span>

                            </summary>

                            <div class="longitudinal-accordion-content">

                                <p>
                                    No hay intentos de contacto registrados.
                                </p>

                            </div>

                        </details>


                        <!-- EXPORTAR -->
                        <div class="longitudinal-actions">

                            <button
                                type="button"
                                id="exportarLongitudinalButton"
                                class="longitudinal-export-button">

                                Exportar información

                            </button>

                        </div>

                    </section>

                </div>

            </section>

        `;

        // Inicializar los controles de la vista
        inicializarLongitudinalidad();

    });

}


// ==================================================
// INICIALIZAR CONTROLES DE LONGITUDINALIDAD
// ==================================================

function inicializarLongitudinalidad() {

    const buscador = document.getElementById(
        "buscarEgresadoLongitudinal"
    );

    const exportarButton = document.getElementById(
        "exportarLongitudinalButton"
    );

    const resultados = document.getElementById("longitudinalResultados");
    const empty = document.getElementById("longitudinalEmpty");
    const total = document.getElementById("longitudinalTotal");
    let timer;

    function celda(texto) {
        const td = document.createElement("td");
        td.textContent = texto || "—";
        return td;
    }

    function mostrarDetalle(egresado) {
        const perfil = document.getElementById("longitudinalProfile");
        const historial = document.getElementById("longitudinalHistorialLaboral");
        if (!perfil || !historial) return;

        perfil.replaceChildren();
        const info = document.createElement("div");
        info.className = "longitudinal-profile-info";
        const nombre = document.createElement("h3");
        nombre.textContent = egresado.nombre;
        const datos = document.createElement("p");
        datos.textContent = `${egresado.correo} · Matrícula: ${egresado.matricula || "—"}`;
        info.append(nombre, datos);
        perfil.append(info);

        historial.replaceChildren();
        for (const empleo of egresado.empleos || []) {
            const row = document.createElement("tr");
            [empleo.periodo, empleo.empresa, empleo.puesto, empleo.area, empleo.tipo]
                .forEach(value => row.append(celda(value)));
            historial.append(row);
        }
    }

    async function cargar() {
        resultados.replaceChildren();
        empty.textContent = "Cargando egresados...";
        empty.hidden = false;
        try {
            const query = buscador.value.trim();
            const respuesta = await gasApi("/api/egresados" +
                (query ? `?buscar=${encodeURIComponent(query)}` : ""));
            total.textContent = `Mostrando ${respuesta.total} egresado(s)`;
            empty.hidden = respuesta.total !== 0;
            empty.textContent = respuesta.total ? "" : "No hay egresados para mostrar.";

            for (const egresado of respuesta.egresados) {
                const row = document.createElement("tr");
                row.append(
                    celda(egresado.nombre),
                    celda(egresado.matricula),
                    celda(egresado.generacion),
                    celda(egresado.situacionLaboral),
                    celda(egresado.ultimaActualizacion
                        ? new Date(egresado.ultimaActualizacion).toLocaleDateString("es-MX")
                        : null)
                );
                const acciones = document.createElement("td");
                const seleccionar = document.createElement("button");
                seleccionar.type = "button";
                seleccionar.textContent = "Seleccionar";
                seleccionar.addEventListener("click", () => mostrarDetalle(egresado));
                acciones.append(seleccionar);
                row.append(acciones);
                resultados.append(row);
            }
        } catch (error) {
            empty.hidden = false;
            empty.textContent = error.message;
            total.textContent = "No fue posible cargar los egresados";
        }
    }

    if (buscador) {
        buscador.addEventListener("input", () => {
            clearTimeout(timer);
            timer = setTimeout(() => cargar(), 250);
        });
    }

    cargar();

    // Exportación pendiente de implementar.
    if (exportarButton) {

        exportarButton.addEventListener("click", function () {

            alert(
                "La exportación estará disponible cuando se conecten los datos."
            );

        });

    }

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