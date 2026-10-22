(() => {
    // Portal del tesista: «Mi tesis» (RF-01.10.1 alta, RF-01.10.3 actualización).
    //
    // Replica vista_alumno_altatesis.png y reemplaza la maqueta de alumno.js sin
    // modificarla, con la técnica del resto del proyecto: captura y
    // stopImmediatePropagation sobre el botón del menú.
    //
    // Sigue el circuito del diagrama `diagrama_proceso_alta_tesis.png`: el tesista
    // presenta una SOLICITUD con los cuatro datos que pide el diagrama más el
    // director que propone, y la tesis no queda registrada hasta que ese director
    // la acepta. Si la rechaza, se muestra el motivo y puede proponer a otro.
    //
    // Una vez aceptada, el formulario se reduce a corregir título y resumen: el
    // estado y el porcentaje los fija el comité con las evaluaciones.
    //
    // La carga del protocolo en PDF queda fuera: no hay endpoint de subida y gasApi
    // no envía multipart. El espacio está en la interfaz, deshabilitado.

    let catalogos = null;

    const area = document.getElementById("contentArea");
    const el = id => document.getElementById(id);
    const txt = v => (v === null || v === undefined || v === "") ? "—" : String(v);
    const fecha = f => (f || "").slice(0, 10);
    function aviso(m, error = true) {
        const p = el("gasAvisoMiTesis");
        if (p) { p.textContent = m; p.className = error ? "error" : "ok"; }
    }
    const opcion = (v, t) => { const o = document.createElement("option"); o.value = v; o.textContent = t; return o; };

    async function cargarCatalogos() {
        if (catalogos) return catalogos;
        const [modalidades, profesores] = await Promise.all([
            gasApi("/api/modalidades"), gasApi("/api/profesores")
        ]);
        catalogos = { modalidades, profesores };
        return catalogos;
    }

    async function abrir() {
        const me = await gasSession;
        if (me.requiereCambio) return;
        await cargarCatalogos();
        const ficha = await gasApi("/api/tesis/mi-tesis");
        const t = ficha.tesis;              // null si todavía no la solicitó
        const revisiones = ficha.revisiones || [];
        // El circuito del diagrama decide qué formulario toca:
        //   sin tesis o rechazada → solicitud (con director, línea y modalidad)
        //   pendiente             → solo lectura, esperando al director
        //   aceptada              → corrección de título y resumen
        const estado = t?.estadoSolicitud ?? null;
        const esSolicitud = !t || estado === "Rechazada";
        const enEspera = estado === "Pendiente";

        const intro = esSolicitud
            ? (estado === "Rechazada"
                ? "Tu solicitud fue rechazada. Revisa el motivo, ajusta lo necesario y propón otro director."
                : "Presenta tu solicitud de tesis. El director que propongas deberá aceptarla para que quede registrada.")
            : enEspera
                ? "Tu solicitud está pendiente de resolución por el director propuesto."
                : "Consulta y actualiza la información de tu tesis.";

        area.innerHTML = `<section class="gas-panel"><h2>Mi tesis</h2>
        <p>${intro}</p>
        ${estado === "Rechazada" ? '<p class="error" id="gasMotivo"></p>' : ""}

        <div class="tesis-card"><h3>Datos del tesista</h3><dl id="gasDatosTesista"></dl></div>

        <h3>${esSolicitud ? "Solicitud de tesis" : "Información de la tesis"}</h3>
        <form id="gasFormMiTesis" class="gas-form-grid">
            <label style="grid-column:1/-1">Título de la tesis <span>*</span>
                <input name="titulo" type="text" maxlength="255" required
                       placeholder="Ingresa el título de tu tesis" ${enEspera ? "disabled" : ""}>
                <small><span id="gasCuentaTitulo">0</span> / 255</small></label>
            <label style="grid-column:1/-1">Resumen de la tesis
                <textarea name="resumen" rows="4" maxlength="1000"
                          placeholder="Ingresa un resumen de tu tesis" ${enEspera ? "disabled" : ""}></textarea>
                <small><span id="gasCuentaResumen">0</span> / 1000</small></label>
            ${esSolicitud ? `
            <label>Línea de investigación <span>*</span>
                <input name="lineaInvestigacion" type="text" maxlength="255" required></label>
            <label>Modalidad de titulación <span>*</span>
                <select name="modalidadId" required></select></label>
            <label style="grid-column:1/-1">Director de tesis <span>*</span>
                <select name="directorRpe" required></select>
                <small>Recibirá tu solicitud y decidirá si acepta dirigirla.</small></label>` : ""}
            <label style="grid-column:1/-1">Documento de protocolo de tesis
                <input type="file" accept="application/pdf" disabled
                       title="La carga de archivos no está implementada todavía"></label>
            <p id="gasAvisoMiTesis" role="status" style="grid-column:1/-1"></p>
            <div style="grid-column:1/-1">
                <button type="submit" ${enEspera ? "disabled" : ""}>${
                    esSolicitud ? "Enviar solicitud" : "Guardar cambios"}</button>
            </div>
        </form>

        <div class="tesis-card"><h3>Estado de seguimiento</h3>
            <p>Esta información la gestiona el comité tutorial y se actualiza conforme
               avancen las evaluaciones.</p>
            <dl id="gasSeguimiento"></dl></div>

        <h3>Evaluaciones registradas</h3>
        <div class="table-scroll"><table><thead><tr>
            <th>Fecha</th><th>Avance</th><th>Criterios</th><th>Comentarios</th><th>Compromisos</th>
        </tr></thead><tbody id="gasFilasMiRevision"></tbody></table></div>
        <p id="gasSinMisRevisiones"></p>
        </section>`;

        const dl = (nodo, pares) => {
            nodo.replaceChildren();
            for (const [k, v] of pares) {
                const dt = document.createElement("dt"), dd = document.createElement("dd");
                dt.textContent = k; dd.textContent = txt(v);
                nodo.append(dt, dd);
            }
        };
        dl(el("gasDatosTesista"), [
            ["Clave del alumno", t ? t.claveAlumno : ficha.claveAlumno],
            ["Nombre del tesista", t?.alumno ?? me.nombre],
            ["Programa académico", t?.programa],
            ["Generación", t?.generacion]
        ]);
        dl(el("gasSeguimiento"), [
            ["Estado de la solicitud", estado ?? "Sin presentar"],
            ["Director", t?.directorRpe
                ? (catalogos.profesores.find(p => p.rpe === t.directorRpe)?.nombre ?? t.directorRpe)
                : null],
            ["Línea de investigación", t?.lineaInvestigacion],
            ["Estado de tesis", t?.estadoTesis ?? "Sin registrar"],
            ["Porcentaje de avance", (t ? t.porcentajeActual : 0) + " %"],
            ["Fecha de registro", t ? fecha(t.fechaRegistro) : null],
            ["Última actualización", t?.ultimaActualizacion ? fecha(t.ultimaActualizacion) : null]
        ]);

        if (estado === "Rechazada") el("gasMotivo").textContent = "Motivo: " + (t.motivoRechazo || "sin especificar");

        const f = el("gasFormMiTesis");
        if (t) { f.elements.titulo.value = t.titulo || ""; f.elements.resumen.value = t.resumen || ""; }
        if (esSolicitud) {
            catalogos.modalidades.forEach(m => f.elements.modalidadId.append(opcion(m.id, m.nombre)));
            f.elements.directorRpe.append(opcion("", "Selecciona un director"));
            catalogos.profesores.forEach(pr => f.elements.directorRpe.append(opcion(pr.rpe, pr.nombre)));
            if (t) {
                f.elements.lineaInvestigacion.value = t.lineaInvestigacion || "";
                if (t.modalidadId) f.elements.modalidadId.value = t.modalidadId;
            }
        }
        // Contadores de caracteres, como en el mockup.
        const contar = (campo, salida) => {
            const actualizar = () => { el(salida).textContent = f.elements[campo].value.length; };
            f.elements[campo].addEventListener("input", actualizar); actualizar();
        };
        contar("titulo", "gasCuentaTitulo");
        contar("resumen", "gasCuentaResumen");
        f.onsubmit = ev => guardar(ev, esSolicitud);

        const body = el("gasFilasMiRevision"); body.replaceChildren();
        for (const r of revisiones) {
            const tr = document.createElement("tr");
            [fecha(r.fecha), `${r.porcentajeAvance}%`, txt(r.criterios), txt(r.comentarios),
             txt(r.compromisos.map(c => c.descripcion).join(" · "))]
                .forEach(v => { const td = document.createElement("td"); td.textContent = v; tr.append(td); });
            body.append(tr);
        }
        el("gasSinMisRevisiones").textContent = revisiones.length
            ? "" : "Tu comité todavía no ha registrado evaluaciones.";
    }

    async function guardar(ev, esSolicitud) {
        ev.preventDefault();
        const f = ev.target, boton = f.querySelector('[type="submit"]');
        boton.disabled = true;
        const datos = {
            titulo: f.elements.titulo.value.trim(),
            resumen: f.elements.resumen.value.trim() || null
        };
        if (esSolicitud) {
            datos.lineaInvestigacion = f.elements.lineaInvestigacion.value.trim();
            datos.modalidadId = Number(f.elements.modalidadId.value);
            datos.directorRpe = Number(f.elements.directorRpe.value);
        }
        try {
            const r = await gasApi("/api/tesis/mi-tesis", esSolicitud ? "POST" : "PUT", datos);
            aviso(r.mensaje, false);
            await abrir();   // repinta: tras el alta ya hay estado y fechas que mostrar
        }
        catch (e) { aviso(e.message); }
        finally { boton.disabled = false; }
    }

    // El menú «Tesis» nace oculto en alumno.css (.tesis-section display:none) y
    // alumno.js lo revela al elegir modalidad. Esa elección ahora se guarda, así que
    // al cargar la página se consulta y el menú aparece solo si corresponde: antes
    // desaparecía en cada recarga.
    (async () => {
        try {
            const m = await gasApi("/api/tesis/mi-modalidad");
            if (m.modalidad === "Tesis") document.getElementById("tesisSection")?.classList.add("visible");
        } catch { /* sin sesión de alumno no hay menú que mostrar */ }
    })();

    el("miTesisButton")?.addEventListener("click", ev => {
        ev.stopImmediatePropagation();
        abrir().catch(e => {
            area.innerHTML = '<section class="gas-panel"><p class="error" id="gasAvisoMiTesis"></p></section>';
            aviso(e.message);
        });
    }, true);
})();
