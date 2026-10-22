(() => {
    // Gestión de tesis para el coordinador (RF-01.10): consulta, alta,
    // actualización y seguimiento del avance.
    //
    // Reúne dos mockups del AMyD en un solo flujo, porque comparten casi todos
    // los datos: `vista_historial_tesista.png` (ficha con comité, gráfica y
    // evaluaciones) y `vista_avance_tesis.png` (formulario de revisión). La lista
    // lleva a la ficha, y la ficha contiene el formulario.
    //
    // La carga de evidencias queda fuera a propósito: no hay endpoint de subida y
    // `gasApi` no envía multipart. El espacio está marcado en la interfaz.

    let catalogos = null;
    let pagina = 1;
    let tesisActual = null;

    const area = document.getElementById("contentArea");
    const el = id => document.getElementById(id);
    const txt = v => (v === null || v === undefined || v === "") ? "—" : String(v);
    const fecha = f => (f || "").slice(0, 10);
    const opcion = (v, t) => { const o = document.createElement("option"); o.value = v; o.textContent = t; return o; };
    function aviso(m, error = true) {
        const p = el("gasAvisoTesis");
        if (p) { p.textContent = m; p.className = error ? "error" : "ok"; }
    }

    async function cargarCatalogos() {
        if (catalogos) return catalogos;
        const [estados, generaciones, periodos] = await Promise.all([
            gasApi("/api/estados-tesis"), gasApi("/api/generaciones"), gasApi("/api/periodos")
        ]);
        catalogos = { estados, generaciones, periodos };
        return catalogos;
    }

    // -----------------------------------------------------------------
    // RF-01.10.2 · Consulta de tesis
    // -----------------------------------------------------------------
    async function abrirConsulta() {
        const me = await gasSession;
        if (me.requiereCambio) return;
        await cargarCatalogos();
        area.innerHTML = `<section class="gas-panel"><h2>Consultar tesis</h2>
        <div class="toolbar">
            <label>Buscar por clave, título o nombre<input id="gasBuscarTesis" type="search"></label>
            <label>Estado de tesis<select id="gasFEstadoTesis"><option value="">Todos</option></select></label>
            <label>Generación<select id="gasFGenTesis"><option value="">Todas</option></select></label>
            <button id="gasFiltrarTesis">Buscar</button><button id="gasLimpiarTesis">Limpiar</button>
        </div>
        <p id="gasAvisoTesis" role="status"></p>
        <div class="table-scroll"><table><thead><tr>
            <th>Clave</th><th>Tesista</th><th>Título</th><th>Estado</th>
            <th>Avance</th><th>Sem.</th><th>Registro</th><th></th>
        </tr></thead><tbody id="gasFilasTesis"></tbody></table></div>
        <button id="gasPrevTesis">Anterior</button><span id="gasCuentaTesis"></span><button id="gasNextTesis">Siguiente</button>
        </section>`;
        catalogos.estados.forEach(e => el("gasFEstadoTesis").append(opcion(e.id, e.nombre)));
        catalogos.generaciones.forEach(g => el("gasFGenTesis").append(opcion(g.id, g.nombre || g.anioIngreso)));
        el("gasFiltrarTesis").onclick = () => { pagina = 1; listar().catch(e => aviso(e.message)); };
        el("gasLimpiarTesis").onclick = () => {
            ["gasBuscarTesis", "gasFEstadoTesis", "gasFGenTesis"].forEach(i => { el(i).value = ""; });
            pagina = 1; listar().catch(e => aviso(e.message));
        };
        el("gasBuscarTesis").onkeydown = ev => { if (ev.key === "Enter") { pagina = 1; listar().catch(e => aviso(e.message)); } };
        el("gasPrevTesis").onclick = () => { pagina--; listar().catch(e => aviso(e.message)); };
        el("gasNextTesis").onclick = () => { pagina++; listar().catch(e => aviso(e.message)); };
        await listar();
    }

    async function listar() {
        const q = new URLSearchParams({ pagina: String(pagina) });
        for (const [id, clave] of [["gasBuscarTesis", "buscar"], ["gasFEstadoTesis", "estadoTesisId"], ["gasFGenTesis", "generacionId"]]) {
            const v = el(id)?.value; if (v) q.set(clave, v);
        }
        const r = await gasApi("/api/tesis?" + q);
        const body = el("gasFilasTesis"); body.replaceChildren();
        for (const t of r.tesis) {
            const tr = document.createElement("tr");
            // textContent en todas las celdas: título y nombres son texto capturado.
            [t.claveAlumno, txt(t.alumno), txt(t.titulo), txt(t.estadoTesis),
             `${t.porcentajeActual}%`, txt(t.semestre), fecha(t.fechaRegistro)]
                .forEach(v => { const td = document.createElement("td"); td.textContent = v; tr.append(td); });
            const acc = document.createElement("td"), b = document.createElement("button");
            b.textContent = "Ver ficha"; b.onclick = () => abrirFicha(t.id).catch(e => aviso(e.message));
            acc.append(b); tr.append(acc); body.append(tr);
        }
        el("gasCuentaTesis").textContent = `${r.total} tesis · Página ${pagina}`;
        el("gasPrevTesis").disabled = pagina <= 1;
        el("gasNextTesis").disabled = pagina * r.tamano >= r.total;
        aviso(r.total ? "" : "Sin resultados.", false);
    }

    // -----------------------------------------------------------------
    // Ficha: historial académico + registro de avance
    // -----------------------------------------------------------------
    async function abrirFicha(id) {
        const me = await gasSession;
        if (me.requiereCambio) return;
        await cargarCatalogos();
        const ficha = await gasApi("/api/tesis/" + id);
        tesisActual = ficha.tesis;

        area.innerHTML = `<section class="gas-panel">
        <button id="gasVolverTesis">← Volver a la lista</button>
        <h2>Historial académico del tesista</h2>
        <div class="tesis-ficha">
            <div class="tesis-card"><h3>Información general</h3>
                <dl id="gasDatosAlumno"></dl></div>
            <div class="tesis-card"><h3>Datos de la tesis</h3>
                <dl id="gasDatosTesis"></dl></div>
            <div class="tesis-card"><h3>Comité tutorial</h3>
                <ul id="gasComite"></ul></div>
            <div class="tesis-card"><h3>Evolución del avance</h3>
                <div id="gasGrafica"></div></div>
        </div>

        <h3>Registrar revisión</h3>
        <form id="gasFormRevision" class="gas-form-grid">
            <label>Fecha de la revisión <span>*</span>
                <input name="fecha" type="date" required></label>
            <label>Porcentaje de avance <span>*</span>
                <input name="porcentajeAvance" type="number" min="0" max="100" step="0.01" required></label>
            <label>Periodo académico
                <select name="periodoId"><option value="">Sin especificar</option></select></label>
            <label>Estado de la revisión
                <input name="estado" type="text" maxlength="50" placeholder="Ej. Favorable"></label>
            <label style="grid-column:1/-1">Criterios de evaluación
                <textarea name="criterios" rows="2" maxlength="1000"
                    placeholder="Rúbrica aplicada: presentación de objetivos, investigación bibliográfica…"></textarea></label>
            <label style="grid-column:1/-1">Comentarios
                <textarea name="comentarios" rows="2" maxlength="2000"></textarea></label>
            <label style="grid-column:1/-1">Compromisos
                <textarea name="compromisos" rows="2" maxlength="2000"
                    placeholder="Acuerdos derivados de la revisión"></textarea></label>
            <label>Fecha de compromiso
                <input name="fechaCompromiso" type="date"></label>
            <label>Evidencias
                <input type="file" disabled title="La carga de archivos no está implementada todavía"></label>
            <p id="gasAvisoTesis" role="status" style="grid-column:1/-1"></p>
            <div style="grid-column:1/-1">
                <button type="submit">Guardar evaluación</button>
                <button type="button" id="gasEditarTesis">Editar tesis</button>
            </div>
        </form>

        <h3>Evaluaciones registradas</h3>
        <div class="table-scroll"><table><thead><tr>
            <th>Fecha</th><th>Avance</th><th>Criterios</th><th>Comentarios</th><th>Compromisos</th><th></th>
        </tr></thead><tbody id="gasFilasRevision"></tbody></table></div>
        <p id="gasSinRevisiones"></p>
        ${dialogoEdicion()}
        </section>`;

        catalogos.periodos.forEach(p => el("gasFormRevision").elements.periodoId.append(opcion(p.id, p.nombre)));
        catalogos.estados.forEach(e => el("gasFormEditar").elements.estadoTesisId.append(opcion(e.id, e.nombre)));
        el("gasFormRevision").elements.fecha.value = new Date().toISOString().slice(0, 10);
        el("gasFormRevision").elements.porcentajeAvance.value = ficha.tesis.porcentajeActual;
        el("gasVolverTesis").onclick = () => abrirConsulta().catch(e => aviso(e.message));
        el("gasFormRevision").onsubmit = guardarRevision;
        el("gasEditarTesis").onclick = () => abrirEdicion(ficha.tesis);
        el("gasCancelarEditar").onclick = () => el("gasDialogTesis").close();
        el("gasFormEditar").onsubmit = guardarEdicion;

        pintarFicha(ficha);
    }

    function pintarFicha(ficha) {
        const t = ficha.tesis;
        const dl = (nodo, pares) => {
            nodo.replaceChildren();
            for (const [k, v] of pares) {
                const dt = document.createElement("dt"), dd = document.createElement("dd");
                dt.textContent = k; dd.textContent = txt(v);
                nodo.append(dt, dd);
            }
        };
        dl(el("gasDatosAlumno"), [
            ["Nombre", t.alumno], ["Clave", t.claveAlumno], ["Programa", t.programa],
            ["Generación", t.generacion], ["Semestre", t.semestre], ["Correo", t.correoAlumno]
        ]);
        dl(el("gasDatosTesis"), [
            ["Título", t.titulo], ["Estado", t.estadoTesis],
            ["Porcentaje de avance", t.porcentajeActual + "%"],
            ["Fecha de registro", fecha(t.fechaRegistro)],
            ["Última actualización", t.ultimaActualizacion ? fecha(t.ultimaActualizacion) : null],
            ["Resumen", t.resumen]
        ]);

        const ul = el("gasComite"); ul.replaceChildren();
        if (!ficha.comite.length) {
            const li = document.createElement("li");
            li.textContent = "Sin comité asignado todavía.";
            ul.append(li);
        } else for (const c of ficha.comite) {
            const li = document.createElement("li");
            li.textContent = `${c.profesor} · ${c.rol}`;
            ul.append(li);
        }

        grafica(ficha.revisiones);

        const body = el("gasFilasRevision"); body.replaceChildren();
        for (const r of ficha.revisiones) {
            const tr = document.createElement("tr");
            const compromisos = r.compromisos.map(c => c.descripcion).join(" · ");
            [fecha(r.fecha), `${r.porcentajeAvance}%`, txt(r.criterios), txt(r.comentarios), txt(compromisos)]
                .forEach(v => { const td = document.createElement("td"); td.textContent = v; tr.append(td); });
            const acc = document.createElement("td");
            // Un compromiso por revisión en la práctica; se marca el primero pendiente.
            const pendiente = r.compromisos.find(c => !c.cumplido);
            if (pendiente) {
                const b = document.createElement("button");
                b.textContent = "Marcar cumplido";
                b.onclick = async () => {
                    b.disabled = true;
                    try { await gasApi(`/api/tesis/compromisos/${pendiente.id}?cumplido=true`, "PUT"); await recargar(); }
                    catch (e) { aviso(e.message); b.disabled = false; }
                };
                acc.append(b);
            }
            tr.append(acc); body.append(tr);
        }
        el("gasSinRevisiones").textContent = ficha.revisiones.length ? "" : "Todavía no hay evaluaciones registradas.";
    }

    // -----------------------------------------------------------------
    // Gráfica de evolución del avance
    //
    // SVG en línea y no una librería: una serie, pocos puntos y cero dependencias
    // nuevas en un proyecto que no tiene ninguna. Color #2e75b6, el secundario del
    // tema, validado contra fondo blanco.
    // -----------------------------------------------------------------
    function grafica(revisiones) {
        const caja = el("gasGrafica"); caja.replaceChildren();
        // Las revisiones llegan de más reciente a más antigua; la gráfica va al revés.
        const puntos = [...revisiones].reverse()
            .map(r => ({ x: fecha(r.fecha), y: Number(r.porcentajeAvance) }))
            .filter(p => p.x);

        if (puntos.length < 2) {
            const p = document.createElement("p");
            p.textContent = puntos.length === 1
                ? `Una sola evaluación (${puntos[0].y}%): hacen falta al menos dos para ver la evolución.`
                : "Sin evaluaciones registradas.";
            caja.append(p);
            return;
        }

        const W = 420, H = 180, M = { t: 18, r: 28, b: 28, l: 34 };
        const ancho = W - M.l - M.r, alto = H - M.t - M.b;
        const px = i => M.l + (ancho * i) / (puntos.length - 1);
        const py = v => M.t + alto - (alto * v) / 100;

        const ns = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(ns, "svg");
        svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
        svg.setAttribute("role", "img");
        svg.setAttribute("aria-label",
            `Evolución del avance: de ${puntos[0].y}% a ${puntos[puntos.length - 1].y}% en ${puntos.length} evaluaciones.`);
        svg.style.width = "100%"; svg.style.height = "auto";

        // Rejilla recesiva, solo cuatro líneas, con su etiqueta.
        for (const v of [0, 25, 50, 75, 100]) {
            const y = py(v);
            const linea = document.createElementNS(ns, "line");
            linea.setAttribute("x1", M.l); linea.setAttribute("x2", W - M.r);
            linea.setAttribute("y1", y); linea.setAttribute("y2", y);
            linea.setAttribute("stroke", v === 0 ? "#cbd5e1" : "#eef2f6");
            linea.setAttribute("stroke-width", "1");
            svg.append(linea);
            const et = document.createElementNS(ns, "text");
            et.setAttribute("x", M.l - 6); et.setAttribute("y", y + 3);
            et.setAttribute("text-anchor", "end");
            et.setAttribute("font-size", "9"); et.setAttribute("fill", "#64748b");
            et.textContent = v + "%";
            svg.append(et);
        }

        const traza = document.createElementNS(ns, "polyline");
        traza.setAttribute("points", puntos.map((p, i) => `${px(i)},${py(p.y)}`).join(" "));
        traza.setAttribute("fill", "none");
        traza.setAttribute("stroke", "#2e75b6");
        traza.setAttribute("stroke-width", "2");
        traza.setAttribute("stroke-linejoin", "round");
        traza.setAttribute("stroke-linecap", "round");
        svg.append(traza);

        puntos.forEach((p, i) => {
            const c = document.createElementNS(ns, "circle");
            c.setAttribute("cx", px(i)); c.setAttribute("cy", py(p.y));
            c.setAttribute("r", "4");
            c.setAttribute("fill", "#2e75b6");
            // Anillo del color de la superficie: separa puntos que se solapan.
            c.setAttribute("stroke", "#ffffff"); c.setAttribute("stroke-width", "2");
            const titulo = document.createElementNS(ns, "title");
            titulo.textContent = `${p.x}: ${p.y}%`;
            c.append(titulo);
            svg.append(c);
        });

        // Solo se etiqueta el último punto: un número en cada uno sería ruido.
        const ultimo = puntos[puntos.length - 1];
        const et = document.createElementNS(ns, "text");
        et.setAttribute("x", px(puntos.length - 1) + 6);
        et.setAttribute("y", py(ultimo.y) + 3);
        et.setAttribute("font-size", "11"); et.setAttribute("font-weight", "600");
        et.setAttribute("fill", "#1f4e79");
        et.textContent = ultimo.y + "%";
        svg.append(et);

        caja.append(svg);
    }

    async function recargar() {
        const ficha = await gasApi("/api/tesis/" + tesisActual.id);
        tesisActual = ficha.tesis;
        pintarFicha(ficha);
    }

    async function guardarRevision(ev) {
        ev.preventDefault();
        const f = ev.target, boton = f.querySelector('[type="submit"]');
        boton.disabled = true;
        try {
            const r = await gasApi(`/api/tesis/${tesisActual.id}/revisiones`, "POST", {
                fecha: f.elements.fecha.value,
                porcentajeAvance: Number(f.elements.porcentajeAvance.value),
                criterios: f.elements.criterios.value.trim() || null,
                comentarios: f.elements.comentarios.value.trim() || null,
                estado: f.elements.estado.value.trim() || null,
                periodoId: f.elements.periodoId.value ? Number(f.elements.periodoId.value) : null,
                compromisos: f.elements.compromisos.value.trim() || null,
                fechaCompromiso: f.elements.fechaCompromiso.value || null
            });
            aviso(r.mensaje, false);
            ["criterios", "comentarios", "estado", "compromisos", "fechaCompromiso"].forEach(n => { f.elements[n].value = ""; });
            await recargar();
        }
        catch (e) { aviso(e.message); }
        finally { boton.disabled = false; }
    }

    // -----------------------------------------------------------------
    // RF-01.10.1 y .3 · Alta y actualización
    // -----------------------------------------------------------------
    function dialogoEdicion() {
        return `<dialog id="gasDialogTesis"><h3 id="gasTituloEditar"></h3>
        <form id="gasFormEditar">
            <label>Clave del alumno <span>*</span>
                <input name="claveAlumno" inputmode="numeric" pattern="[0-9]{6}" placeholder="Ej. 300103"></label>
            <label>Título de la tesis <span>*</span>
                <input name="titulo" type="text" maxlength="255" required></label>
            <label>Resumen
                <textarea name="resumen" rows="4" maxlength="1000"></textarea></label>
            <label id="gasCampoEstado">Estado de tesis
                <select name="estadoTesisId"></select></label>
            <label id="gasCampoPorcentaje">Porcentaje de avance
                <input name="porcentajeActual" type="number" min="0" max="100" step="0.01"></label>
            <p id="gasAvisoEditar" class="error" role="status"></p>
            <div><button type="submit">Guardar</button>
                 <button type="button" id="gasCancelarEditar">Cancelar</button></div>
        </form></dialog>`;
    }

    function abrirEdicion(t) {
        const f = el("gasFormEditar"); f.reset();
        el("gasAvisoEditar").textContent = "";
        const alta = !t;
        el("gasTituloEditar").textContent = alta ? "Registrar tesis" : "Editar tesis";
        // En el alta hace falta la clave del alumno; al editar ya está decidida.
        el("gasCampoEstado").hidden = alta;
        el("gasCampoPorcentaje").hidden = alta;
        f.elements.claveAlumno.closest("label").hidden = !alta;
        f.elements.claveAlumno.required = alta;
        if (!alta) {
            f.elements.titulo.value = t.titulo || "";
            f.elements.resumen.value = t.resumen || "";
            f.elements.estadoTesisId.value = t.estadoTesisId ?? "";
            f.elements.porcentajeActual.value = t.porcentajeActual ?? 0;
        }
        el("gasDialogTesis").showModal();
    }

    async function guardarEdicion(ev) {
        ev.preventDefault();
        const f = ev.target, boton = f.querySelector('[type="submit"]');
        boton.disabled = true;
        const alta = !tesisActual;
        try {
            if (alta) {
                const r = await gasApi("/api/tesis/" + Number(f.elements.claveAlumno.value), "POST", {
                    titulo: f.elements.titulo.value.trim(),
                    resumen: f.elements.resumen.value.trim() || null
                });
                el("gasDialogTesis").close();
                await abrirFicha(r.id);
            } else {
                await gasApi("/api/tesis/" + tesisActual.id, "PUT", {
                    titulo: f.elements.titulo.value.trim(),
                    resumen: f.elements.resumen.value.trim() || null,
                    estadoTesisId: Number(f.elements.estadoTesisId.value),
                    porcentajeActual: Number(f.elements.porcentajeActual.value)
                });
                el("gasDialogTesis").close();
                await recargar();
                aviso("Tesis actualizada.", false);
            }
        }
        catch (e) { el("gasAvisoEditar").textContent = e.message; }
        finally { boton.disabled = false; }
    }

    async function abrirAlta() {
        const me = await gasSession;
        if (me.requiereCambio) return;
        await cargarCatalogos();
        tesisActual = null;
        area.innerHTML = `<section class="gas-panel"><h2>Registrar tesis</h2>
        <p id="gasAvisoTesis" role="status"></p>
        <button id="gasAbrirAlta">Nueva tesis</button>
        ${dialogoEdicion()}</section>`;
        catalogos.estados.forEach(e => el("gasFormEditar").elements.estadoTesisId.append(opcion(e.id, e.nombre)));
        el("gasCancelarEditar").onclick = () => el("gasDialogTesis").close();
        el("gasFormEditar").onsubmit = guardarEdicion;
        el("gasAbrirAlta").onclick = () => abrirEdicion(null);
        abrirEdicion(null);
    }

    // Despliega el submenú, como hacen los demás menús del panel.
    el("tesisMenu")?.addEventListener("click", () => {
        const sub = el("tesisSubmenu"), flecha = el("tesisArrow");
        const visible = sub.style.display !== "none";
        sub.style.display = visible ? "none" : "flex";
        if (flecha) flecha.textContent = visible ? "⌄" : "⌃";
    });
    el("consultarTesisButton")?.addEventListener("click", () => abrirConsulta().catch(e => {
        area.innerHTML = '<section class="gas-panel"><p class="error" id="gasAvisoTesis"></p></section>';
        aviso(e.message);
    }));
    el("registrarTesisButton")?.addEventListener("click", () => abrirAlta().catch(e => {
        area.innerHTML = '<section class="gas-panel"><p class="error" id="gasAvisoTesis"></p></section>';
        aviso(e.message);
    }));
})();
