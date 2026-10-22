(() => {
    // Portal del director: solicitudes de dirección (RF-01.10.1) y asignación del
    // comité tutorial (RF-01.10.6).
    //
    // El diagrama `diagrama_proceso_alta_tesis.png` dice «Notificar al Director
    // propuesto». El proyecto no tiene sistema de notificaciones, así que la
    // notificación es esta bandeja: el director ve aquí las solicitudes que esperan
    // su resolución y decide. Sin su aceptación la tesis no se registra oficialmente.
    //
    // No hay mockup de esta vista en el AMyD: `portal_asesor.png` muestra el portal
    // del profesor pero con el registro de evaluación (RF-04), y su menú no incluye
    // solicitudes. Se siguen las clases del panel para que encaje visualmente.

    let profesores = null;

    const area = document.getElementById("contentArea");
    const el = id => document.getElementById(id);
    const txt = v => (v === null || v === undefined || v === "") ? "—" : String(v);
    const fecha = f => (f || "").slice(0, 10);
    function aviso(m, error = true) {
        const p = el("gasAvisoDir");
        if (p) { p.textContent = m; p.className = error ? "error" : "ok"; }
    }

    async function abrir() {
        const me = await gasSession;
        if (me.requiereCambio) return;
        area.innerHTML = `<section class="gas-panel">
            <h2>Solicitudes de dirección</h2>
            <p id="gasAvisoDir" role="status"></p>
            <div id="gasSolicitudes"></div>
        </section>`;
        await cargar();
    }

    async function cargar() {
        const r = await gasApi("/api/tesis/solicitudes");
        const caja = el("gasSolicitudes"); caja.replaceChildren();

        if (!r.total) {
            const p = document.createElement("p");
            p.textContent = "No tienes solicitudes pendientes.";
            caja.append(p);
            return;
        }

        for (const s of r.solicitudes) {
            const tarjeta = document.createElement("div");
            tarjeta.className = "tesis-card";

            const h = document.createElement("h3");
            // textContent: el título lo escribió el tesista.
            h.textContent = s.titulo;
            tarjeta.append(h);

            const dl = document.createElement("dl");
            for (const [k, v] of [
                ["Tesista", s.alumno], ["Clave", s.claveAlumno],
                ["Generación", s.generacion], ["Semestre", s.semestre],
                ["Línea de investigación", s.lineaInvestigacion],
                ["Resumen", s.resumen],
                ["Fecha de solicitud", fecha(s.fechaSolicitud)]
            ]) {
                const dt = document.createElement("dt"), dd = document.createElement("dd");
                dt.textContent = k; dd.textContent = txt(v);
                dl.append(dt, dd);
            }
            tarjeta.append(dl);

            const aceptar = document.createElement("button");
            aceptar.textContent = "Aceptar dirección";

            const rechazar = document.createElement("button");
            rechazar.textContent = "Rechazar";

            const acciones = document.createElement("div");
            acciones.className = "gas-acciones";
            acciones.append(aceptar, rechazar);

            // El motivo solo aparece al pulsar Rechazar: el servidor lo exige, pero
            // tenerlo siempre a la vista invita a rechazar y ensucia la tarjeta.
            const bloqueMotivo = document.createElement("div");
            bloqueMotivo.className = "gas-motivo-bloque";
            bloqueMotivo.hidden = true;

            const etiqueta = document.createElement("label");
            etiqueta.textContent = "Motivo del rechazo";
            const motivo = document.createElement("input");
            motivo.type = "text"; motivo.maxLength = 255; motivo.required = true;
            etiqueta.append(motivo);

            const confirmar = document.createElement("button");
            confirmar.textContent = "Confirmar rechazo";
            const cancelar = document.createElement("button");
            cancelar.textContent = "Cancelar";

            const botonesMotivo = document.createElement("div");
            botonesMotivo.className = "gas-acciones";
            botonesMotivo.append(confirmar, cancelar);
            bloqueMotivo.append(etiqueta, botonesMotivo);

            aceptar.onclick = () => resolver(s.id, true, null, [aceptar, rechazar]);
            rechazar.onclick = () => {
                bloqueMotivo.hidden = false;
                acciones.hidden = true;
                motivo.focus();
            };
            cancelar.onclick = () => {
                bloqueMotivo.hidden = true;
                acciones.hidden = false;
                motivo.value = "";
                aviso("", false);
            };
            confirmar.onclick = () => {
                const m = motivo.value.trim();
                if (!m) { aviso("Indica el motivo del rechazo."); motivo.focus(); return; }
                resolver(s.id, false, m, [confirmar, cancelar]);
            };
            // Enter dentro del campo equivale a confirmar.
            motivo.onkeydown = ev => { if (ev.key === "Enter") { ev.preventDefault(); confirmar.click(); } };

            tarjeta.append(acciones, bloqueMotivo);
            caja.append(tarjeta);
        }
    }

    async function resolver(id, aceptar, motivoRechazo, botones) {
        botones.forEach(b => { b.disabled = true; });
        try {
            const r = await gasApi(`/api/tesis/${id}/solicitud`, "PUT", { aceptar, motivoRechazo });
            aviso(r.mensaje, false);
            await cargar();
        }
        catch (e) { aviso(e.message); botones.forEach(b => { b.disabled = false; }); }
    }

    // -----------------------------------------------------------------
    // RF-01.10.6 · Asignación de comité
    //
    // Sigue `diagrama Asignación de comité por el director de tesis.png`: el
    // director consulta sus tesistas asignados y elige codirector y sinodales.
    // Él no aparece en la lista: ya consta como director por haber aceptado.
    // La clave del comité la genera el servidor.
    //
    // Hasta que la tesis tenga comité no puede recibir evaluaciones, así que
    // esta pantalla es el paso que desbloquea el seguimiento del avance.
    // -----------------------------------------------------------------
    async function abrirTesistas() {
        const me = await gasSession;
        if (me.requiereCambio) return;
        if (!profesores) profesores = await gasApi("/api/profesores");
        area.innerHTML = `<section class="gas-panel">
            <h2>Mis tesistas</h2>
            <p id="gasAvisoDir" role="status"></p>
            <div id="gasTesistas"></div>
        </section>`;
        await cargarTesistas();
    }

    async function cargarTesistas() {
        const r = await gasApi("/api/tesis/mis-tesistas");
        const caja = el("gasTesistas"); caja.replaceChildren();

        if (!r.total) {
            const p = document.createElement("p");
            p.textContent = "Todavía no diriges ninguna tesis.";
            caja.append(p);
            return;
        }

        for (const fila of r.tesis) {
            const t = fila.vista;
            const tarjeta = document.createElement("div");
            tarjeta.className = "tesis-card";

            const h = document.createElement("h3");
            h.textContent = t.titulo;
            tarjeta.append(h);

            const dl = document.createElement("dl");
            for (const [k, v] of [
                ["Tesista", t.alumno], ["Clave", t.claveAlumno],
                ["Línea de investigación", t.lineaInvestigacion],
                ["Estado de tesis", t.estadoTesis],
                ["Avance", t.porcentajeActual + "%"],
                ["Comité", fila.tieneComite ? "Asignado" : "Sin asignar"]
            ]) {
                const dt = document.createElement("dt"), dd = document.createElement("dd");
                dt.textContent = k; dd.textContent = txt(v);
                dl.append(dt, dd);
            }
            tarjeta.append(dl);

            if (!fila.tieneComite) tarjeta.append(formularioComite(t.id));
            caja.append(tarjeta);
        }
    }

    function formularioComite(idTesis) {
        const form = document.createElement("form");
        form.className = "gas-form-grid";

        // El director no se elige a sí mismo, así que no se filtra de la lista:
        // el servidor rechaza si aparece, y el mensaje lo explica.
        const select = (nombre, etiqueta, obligatorio) => {
            const label = document.createElement("label");
            label.textContent = etiqueta;
            const sel = document.createElement("select");
            sel.name = nombre;
            if (obligatorio) sel.required = true;
            const vacia = document.createElement("option");
            vacia.value = ""; vacia.textContent = obligatorio ? "Selecciona" : "Sin codirector";
            sel.append(vacia);
            profesores.forEach(p => {
                const o = document.createElement("option");
                o.value = p.rpe; o.textContent = p.nombre;
                sel.append(o);
            });
            label.append(sel);
            return label;
        };

        form.append(
            select("codirectorRpe", "Codirector (opcional)", false),
            select("sinodal1", "Sinodal 1", true),
            select("sinodal2", "Sinodal 2", false),
            select("sinodal3", "Sinodal 3", false)
        );

        const acciones = document.createElement("div");
        acciones.className = "gas-acciones";
        acciones.style.gridColumn = "1/-1";
        const guardar = document.createElement("button");
        guardar.type = "submit";
        guardar.textContent = "Asignar comité";
        acciones.append(guardar);
        form.append(acciones);

        form.onsubmit = async ev => {
            ev.preventDefault();
            const sinodales = ["sinodal1", "sinodal2", "sinodal3"]
                .map(n => form.elements[n].value).filter(Boolean).map(Number);
            if (!sinodales.length) { aviso("Selecciona al menos un sinodal."); return; }
            if (new Set(sinodales).size !== sinodales.length) { aviso("No repitas un profesor entre los sinodales."); return; }
            guardar.disabled = true;
            try {
                const r = await gasApi(`/api/tesis/${idTesis}/comite`, "POST", {
                    codirectorRpe: form.elements.codirectorRpe.value ? Number(form.elements.codirectorRpe.value) : null,
                    sinodalesRpe: sinodales
                });
                aviso(r.mensaje, false);
                await cargarTesistas();
            }
            catch (e) { aviso(e.message); guardar.disabled = false; }
        };
        return form;
    }

    el("misTesistasButton")?.addEventListener("click", ev => {
        ev.stopImmediatePropagation();
        abrirTesistas().catch(e => {
            area.innerHTML = '<section class="gas-panel"><p class="error" id="gasAvisoDir"></p></section>';
            aviso(e.message);
        });
    }, true);

    el("solicitudesTesisButton")?.addEventListener("click", ev => {
        ev.stopImmediatePropagation();
        abrir().catch(e => {
            area.innerHTML = '<section class="gas-panel"><p class="error" id="gasAvisoDir"></p></section>';
            aviso(e.message);
        });
    }, true);
})();
