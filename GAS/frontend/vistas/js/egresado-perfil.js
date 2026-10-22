(() => {
    // Portal del egresado: datos personales (RF-02.3) e historial laboral (RF-02.4).
    //
    // Reemplaza las dos acciones del prototipo de egresados.js sin modificarlo,
    // con la misma técnica que usuarios.js y alumnos.js: escucha en fase de
    // captura y detiene la propagación.
    //
    // Pinta sus propios formularios en vez de reutilizar los maquetados porque a
    // aquéllos les faltan cinco campos que el AMyD pide (sector, ciudad, sueldo,
    // actividades y trabajo actual) y los del formulario personal no tienen `id`,
    // así que no se pueden leer. Se conservan sus clases de CSS para que la
    // apariencia no cambie.
    //
    // La clave del egresado NUNCA se envía: el servidor la resuelve de la sesión.

    let situaciones = [];
    let editando = null;   // id del empleo en edición, o null para uno nuevo

    const area = document.getElementById("contentArea");
    const el = id => document.getElementById(id);
    const txt = v => (v === null || v === undefined || v === "") ? "—" : v;

    function opcion(value, text, selected) {
        const o = document.createElement("option");
        o.value = value; o.textContent = text; o.selected = !!selected;
        return o;
    }
    function aviso(mensaje, esError = true) {
        const p = el("gasAviso");
        if (p) { p.textContent = mensaje; p.className = esError ? "error" : ""; }
    }
    const soloFecha = f => (f || "").slice(0, 10);

    // -----------------------------------------------------------------
    // RF-02.3 · Datos personales
    // -----------------------------------------------------------------
    async function abrirPersonales() {
        const me = await gasSession;
        if (me.requiereCambio) return;
        const perfil = await gasApi("/api/egresados/mi-perfil");

        area.innerHTML = `<div class="graduate-update-page">
            <div class="graduate-update-header">
                <h2>Actualizar datos personales</h2>
                <p>Mantén tus datos al día para que el posgrado pueda localizarte.</p>
            </div>
            <section class="graduate-update-card">
                <h3>Identificación</h3>
                <p><strong>${""}</strong></p>
                <div class="graduate-update-grid">
                    <div class="graduate-update-field"><label>Nombre</label>
                        <input id="gasNombre" type="text" disabled></div>
                    <div class="graduate-update-field"><label>Clave de egresado</label>
                        <input id="gasIdent" type="text" disabled></div>
                </div>
                <h3>Contacto</h3>
                <form id="gasFormPersonal">
                <div class="graduate-update-grid">
                    <div class="graduate-update-field"><label>Correo electrónico <span>*</span></label>
                        <input name="correo" type="email" maxlength="100" required></div>
                    <div class="graduate-update-field"><label>Teléfono</label>
                        <input name="telefono" type="tel" maxlength="20" pattern="[0-9+\\-() ]{8,20}"
                               placeholder="Ej. 444 123 4567"></div>
                    <div class="graduate-update-field"><label>Ciudad</label>
                        <input name="ciudad" type="text" maxlength="100"></div>
                    <div class="graduate-update-field"><label>Otros medios de contacto</label>
                        <input name="otrosContactos" type="text" maxlength="255"
                               placeholder="LinkedIn, teléfono alterno, red social…"></div>
                </div>
                <p id="gasAviso" role="status"></p>
                <div class="graduate-update-actions">
                    <button type="submit">Guardar cambios</button>
                    <button type="button" id="gasVolver">Volver</button>
                </div></form>
                <p id="gasSello"></p>
            </section></div>`;

        // textContent y no interpolación: el nombre viene de la base de datos.
        el("gasNombre").value = perfil.nombre || "";
        el("gasIdent").value = perfil.identificador || "";
        const f = el("gasFormPersonal");
        f.elements.correo.value = perfil.correo || "";
        f.elements.telefono.value = perfil.telefono || "";
        f.elements.ciudad.value = perfil.ciudad || "";
        f.elements.otrosContactos.value = perfil.otrosContactos || "";
        el("gasSello").textContent = perfil.ultimaActualizacion
            ? `Última actualización: ${soloFecha(perfil.ultimaActualizacion)}` + (perfil.localizable ? "" : " · marcado como no localizable")
            : "Aún no has actualizado tus datos.";

        f.onsubmit = guardarPersonales;
        el("gasVolver").onclick = () => el("perfilegresadoButton").click();
    }

    async function guardarPersonales(ev) {
        ev.preventDefault();
        const f = ev.target, boton = f.querySelector('[type="submit"]');
        boton.disabled = true;
        try {
            const r = await gasApi("/api/egresados/mi-perfil", "PUT", {
                correo: f.elements.correo.value.trim(),
                telefono: f.elements.telefono.value.trim() || null,
                ciudad: f.elements.ciudad.value.trim() || null,
                otrosContactos: f.elements.otrosContactos.value.trim() || null
            });
            aviso(r.mensaje, false);
            // Actualizar los datos te devuelve a «localizable», así que el sello cambia.
            const perfil = await gasApi("/api/egresados/mi-perfil");
            el("gasSello").textContent = `Última actualización: ${soloFecha(perfil.ultimaActualizacion)}`;
        }
        catch (e) { aviso(e.message); }
        finally { boton.disabled = false; }
    }

    // -----------------------------------------------------------------
    // RF-02.4 · Historial laboral
    // -----------------------------------------------------------------
    async function abrirLaborales() {
        const me = await gasSession;
        if (me.requiereCambio) return;
        if (!situaciones.length) situaciones = await gasApi("/api/situaciones-laborales");

        area.innerHTML = `<div class="graduate-update-page">
            <div class="graduate-update-header">
                <h2>Actualizar historial laboral</h2>
                <p>Cada empleo queda registrado: el historial no se sobrescribe.</p>
            </div>
            <section class="graduate-update-card">
                <h3>Historial registrado</h3>
                <div class="table-scroll"><table><thead><tr>
                    <th>Empresa</th><th>Puesto</th><th>Área</th><th>Periodo</th>
                    <th>Situación</th><th>Actual</th><th></th>
                </tr></thead><tbody id="gasFilasEmpleo"></tbody></table></div>
                <p id="gasSinEmpleos"></p>
            </section>
            <section class="graduate-update-card">
                <h3 id="gasTituloEmpleo">Agregar registro laboral</h3>
                <form id="gasFormLaboral">
                <div class="graduate-update-grid">
                    <div class="graduate-update-field"><label>Situación laboral <span>*</span></label>
                        <select name="situacionLaboralId" class="graduate-update-select" required></select></div>
                    <div class="graduate-update-field"><label>Institución o empresa <span>*</span></label>
                        <input name="empresa" type="text" maxlength="150" required></div>
                    <div class="graduate-update-field"><label>Sector</label>
                        <input name="sector" type="text" maxlength="100" placeholder="Ej. Gubernamental"></div>
                    <div class="graduate-update-field"><label>Ciudad</label>
                        <input name="ciudad" type="text" maxlength="100"></div>
                    <div class="graduate-update-field"><label>Puesto <span>*</span></label>
                        <input name="puesto" type="text" maxlength="100" required></div>
                    <div class="graduate-update-field"><label>Área profesional</label>
                        <input name="areaProfesional" type="text" maxlength="100"></div>
                    <div class="graduate-update-field"><label>Fecha de inicio <span>*</span></label>
                        <input name="fechaInicio" type="date" required></div>
                    <div class="graduate-update-field"><label>Fecha de fin</label>
                        <input name="fechaFinal" type="date"></div>
                    <div class="graduate-update-field"><label>Sueldo mensual</label>
                        <input name="sueldo" type="number" min="0" max="9999999.99" step="0.01"></div>
                    <div class="graduate-update-field"><label>¿Relacionado con el posgrado?</label>
                        <select name="relacionPosgrado" class="graduate-update-select">
                            <option value="true">Sí</option><option value="false">No</option></select></div>
                    <div class="graduate-update-field"><label>¿Es tu trabajo actual?</label>
                        <select name="trabajoActual" class="graduate-update-select">
                            <option value="true">Sí</option><option value="false">No</option></select></div>
                    <div class="graduate-update-field" style="grid-column:1/-1"><label>Actividades realizadas</label>
                        <textarea name="actividades" rows="3"
                                  placeholder="Describe brevemente tus funciones"></textarea></div>
                </div>
                <p id="gasAviso" role="status"></p>
                <div class="graduate-update-actions">
                    <button type="submit" id="gasGuardarEmpleo">Agregar registro</button>
                    <button type="button" id="gasCancelarEmpleo" hidden>Cancelar edición</button>
                    <button type="button" id="gasVolver">Volver</button>
                </div></form>
            </section></div>`;

        const sel = el("gasFormLaboral").elements.situacionLaboralId;
        situaciones.forEach(s => sel.append(opcion(s.id, s.nombre)));
        el("gasFormLaboral").onsubmit = guardarEmpleo;
        el("gasCancelarEmpleo").onclick = () => nuevoRegistro();
        el("gasVolver").onclick = () => el("perfilegresadoButton").click();
        // Un empleo marcado como actual no puede llevar fecha de fin: el servidor lo
        // rechaza, así que conviene impedirlo también aquí.
        const form = el("gasFormLaboral");
        form.elements.trabajoActual.onchange = () => {
            const actual = form.elements.trabajoActual.value === "true";
            form.elements.fechaFinal.disabled = actual;
            if (actual) form.elements.fechaFinal.value = "";
        };
        await cargarHistorial();
    }

    async function cargarHistorial() {
        const r = await gasApi("/api/egresados/mi-perfil/empleos");
        const body = el("gasFilasEmpleo"); body.replaceChildren();
        for (const em of r.empleos) {
            const d = em.detalles[0] || {};
            const tr = document.createElement("tr");
            const periodo = d.fechaInicio
                ? `${soloFecha(d.fechaInicio)} → ${d.fechaFinal ? soloFecha(d.fechaFinal) : "actualidad"}`
                : "—";
            // textContent en cada celda: son datos que el propio egresado escribió.
            [txt(em.empresa), txt(d.puesto), txt(em.areaProfesional), periodo,
             txt(em.situacionLaboral), em.trabajoActual ? "Sí" : "No"]
                .forEach(t => { const td = document.createElement("td"); td.textContent = t; tr.append(td); });
            const acc = document.createElement("td"), b = document.createElement("button");
            b.textContent = "Editar"; b.onclick = () => editarEmpleo(em, d);
            acc.append(b); tr.append(acc); body.append(tr);
        }
        el("gasSinEmpleos").textContent = r.total ? "" : "Todavía no has registrado ningún empleo.";
    }

    function nuevoRegistro() {
        editando = null;
        const f = el("gasFormLaboral"); f.reset();
        f.elements.fechaFinal.disabled = false;
        el("gasTituloEmpleo").textContent = "Agregar registro laboral";
        el("gasGuardarEmpleo").textContent = "Agregar registro";
        el("gasCancelarEmpleo").hidden = true;
        aviso("", false);
    }

    function editarEmpleo(em, d) {
        editando = em.id;
        const f = el("gasFormLaboral"); f.reset();
        f.elements.situacionLaboralId.value = em.situacionLaboralId ?? "";
        f.elements.empresa.value = em.empresa || "";
        f.elements.sector.value = em.sector || "";
        f.elements.ciudad.value = em.ciudad || "";
        f.elements.puesto.value = d.puesto || "";
        f.elements.areaProfesional.value = em.areaProfesional || "";
        f.elements.fechaInicio.value = soloFecha(d.fechaInicio);
        f.elements.fechaFinal.value = soloFecha(d.fechaFinal);
        f.elements.sueldo.value = d.sueldo ?? "";
        f.elements.relacionPosgrado.value = String(!!d.relacionPosgrado);
        f.elements.trabajoActual.value = String(!!em.trabajoActual);
        f.elements.fechaFinal.disabled = !!em.trabajoActual;
        f.elements.actividades.value = d.actividades || "";
        el("gasTituloEmpleo").textContent = `Editar: ${em.empresa || "registro"}`;
        el("gasGuardarEmpleo").textContent = "Guardar cambios";
        el("gasCancelarEmpleo").hidden = false;
        aviso("", false);
        el("gasTituloEmpleo").scrollIntoView({ behavior: "smooth", block: "start" });
    }

    async function guardarEmpleo(ev) {
        ev.preventDefault();
        const f = ev.target, boton = el("gasGuardarEmpleo");
        boton.disabled = true;
        const datos = {
            empresa: f.elements.empresa.value.trim(),
            sector: f.elements.sector.value.trim() || null,
            ciudad: f.elements.ciudad.value.trim() || null,
            puesto: f.elements.puesto.value.trim(),
            areaProfesional: f.elements.areaProfesional.value.trim() || null,
            situacionLaboralId: Number(f.elements.situacionLaboralId.value),
            fechaInicio: f.elements.fechaInicio.value,
            fechaFinal: f.elements.fechaFinal.value || null,
            sueldo: f.elements.sueldo.value === "" ? null : Number(f.elements.sueldo.value),
            relacionPosgrado: f.elements.relacionPosgrado.value === "true",
            trabajoActual: f.elements.trabajoActual.value === "true",
            actividades: f.elements.actividades.value.trim() || null
        };
        try {
            const ruta = editando ? "/api/egresados/mi-perfil/empleos/" + editando : "/api/egresados/mi-perfil/empleos";
            const r = await gasApi(ruta, editando ? "PUT" : "POST", datos);
            aviso(r.mensaje, false);
            nuevoRegistro();
            await cargarHistorial();
        }
        catch (e) { aviso(e.message); }
        finally { boton.disabled = false; }
    }

    // Los dos botones se pintan dentro de «Mi perfil», así que no existen al cargar
    // la página. Se interceptan por delegación en el contenedor, en fase de captura.
    area.addEventListener("click", ev => {
        const personales = ev.target.closest("#actualizarDatosPersonalesButton");
        const laborales = ev.target.closest("#actualizarDatosLaboralesButton");
        if (!personales && !laborales) return;
        ev.stopImmediatePropagation();
        ev.preventDefault();
        (personales ? abrirPersonales() : abrirLaborales()).catch(e => {
            area.insertAdjacentHTML("afterbegin", '<p class="error" id="gasAviso"></p>');
            aviso(e.message);
        });
    }, true);
})();
