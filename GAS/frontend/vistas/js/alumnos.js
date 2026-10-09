(() => {
    // Alta de alumnos. La vía principal es importarlos de la base de la universidad
    // por su clave; el alta manual queda como salida de emergencia para quien no
    // aparezca ahí.
    //
    // Reemplaza las acciones de alumnos del prototipo (coordinador.js) sin tocarlo,
    // igual que usuarios.js: escucha en fase de captura y detiene la propagación.
    let filas = [];        // { externo, datos, seleccionado, resultado }
    let catalogos = null;
    let ultimo = null;     // últimos datos completados, para "copiar del anterior"
    let editando = null;   // clave que se está completando, o "manual"
    let pagina = 1;

    const area = document.getElementById("contentArea");
    const CLAVE = /^\d{6}$/;   // la universidad asigna claves de 6 cifras

    function option(value, text) { const o = document.createElement("option"); o.value = value; o.textContent = text; return o; }
    function el(id) { return document.getElementById(id); }
    function mostrarError(e) { const p = el("gasMessage"); if (p) p.textContent = e.message; }

    async function cargarCatalogos() {
        if (catalogos) return catalogos;
        const [programas, generaciones, modalidades, estados, periodos] = await Promise.all([
            gasApi("/api/programas"), gasApi("/api/generaciones"), gasApi("/api/modalidades"),
            gasApi("/api/estados-academicos"), gasApi("/api/periodos")
        ]);
        catalogos = { programas, generaciones, modalidades, estados, periodos };
        return catalogos;
    }

    // -----------------------------------------------------------------
    // Vista de importación
    // -----------------------------------------------------------------
    async function abrirImportacion() {
        const me = await gasSession;
        if (me.requiereCambio) return;
        await cargarCatalogos();
        area.innerHTML = `<section class="gas-panel"><h2>Alta de alumnos</h2>
        <div class="toolbar"><label style="flex:1 1 100%">Claves de alumno (6 cifras, separadas por comas, espacios o saltos de línea)
        <textarea id="gasClaves" rows="3" placeholder="Ej. 300103, 300104"></textarea></label>
        <button id="gasBuscar">Buscar</button><span>· o ·</span><button id="gasManual">Registrar manualmente</button></div>
        <p id="gasMessage" class="error" role="status"></p>
        <div class="table-scroll"><table><thead><tr><th></th><th>Clave</th><th>Nombre</th><th>Correo institucional</th><th>En la universidad</th><th>Situación</th><th>Datos</th><th></th></tr></thead><tbody id="gasRows"></tbody></table></div>
        <p id="gasPendientes"></p>
        <button id="gasImportar" disabled>Importar seleccionados</button>
        <div id="gasResultado"></div>
        ${plantillaDialogo()}</section>`;

        el("gasBuscar").onclick = () => buscar().catch(mostrarError);
        el("gasManual").onclick = () => completar("manual");
        el("gasImportar").onclick = () => importar().catch(mostrarError);
        el("gasCancelar").onclick = () => el("gasDialogAlumno").close();
        el("gasCopiarAnterior").onclick = copiarDelAnterior;
        el("gasFormAlumno").onsubmit = guardarCompletado;
        poblarSelects();
        restaurar();
        pintarFilas();
    }

    function plantillaDialogo() {
        return `<dialog id="gasDialogAlumno"><h3 id="gasTituloAlumno"></h3><form id="gasFormAlumno">
        <fieldset id="gasIdentidad"><legend>Datos de la universidad</legend>
        <label>Clave del alumno<input name="claveAlumno" inputmode="numeric" pattern="[0-9]{6}" required placeholder="Ej. 300103"></label>
        <label>Nombre<input name="nombre" required maxlength="50"></label>
        <label>Apellido paterno<input name="apellidoPaterno" required maxlength="50"></label>
        <label>Apellido materno<input name="apellidoMaterno" maxlength="50"></label>
        <label>Correo institucional<input name="correoInstitucional" type="email" required maxlength="100"></label></fieldset>
        <fieldset><legend>Datos a completar</legend>
        <label>Fecha de ingreso<input name="fechaIngreso" type="date" required></label>
        <label>Programa académico<select name="programaId" required></select></label>
        <label>Generación<select name="generacionId" required></select></label>
        <label>Periodo académico<select name="periodoId" required></select></label>
        <label>Semestre<input name="semestre" type="number" min="1" max="20" required></label>
        <label>Modalidad de titulación<select name="modalidadId" required></select></label>
        <label>Estado académico<select name="estadoAcademicoId" required></select></label>
        <label>Correo personal<input name="correoPersonal" type="email" required maxlength="100"></label>
        <label>Teléfono<input name="telefono" required maxlength="20" pattern="[0-9+\\-() ]{8,20}" placeholder="Ej. 444 123 4567"></label>
        <label>Activo<select name="activo"><option value="true">Sí</option><option value="false">No</option></select></label></fieldset>
        <p id="gasFormMessage" class="error" role="status"></p>
        <div><button type="submit">Guardar</button><button type="button" id="gasCopiarAnterior">Copiar del anterior</button><button type="button" id="gasCancelar">Cancelar</button></div></form></dialog>`;
    }

    function poblarSelects() {
        const f = el("gasFormAlumno");
        catalogos.programas.forEach(p => f.elements.programaId.append(option(p.id, p.nombre)));
        catalogos.modalidades.forEach(m => f.elements.modalidadId.append(option(m.id, m.nombre)));
        catalogos.estados.forEach(e => f.elements.estadoAcademicoId.append(option(e.id, e.nombre)));
        catalogos.periodos.forEach(p => f.elements.periodoId.append(option(p.id, p.nombre)));
        // La generación depende del programa: se filtra sin pedir nada al servidor,
        // que de todos modos revalida la coherencia.
        f.elements.programaId.onchange = filtrarGeneraciones;
        filtrarGeneraciones();
    }

    function filtrarGeneraciones() {
        const f = el("gasFormAlumno"), programaId = Number(f.elements.programaId.value);
        const sel = f.elements.generacionId, previa = sel.value;
        sel.replaceChildren();
        catalogos.generaciones.filter(g => g.programaId === programaId)
            .forEach(g => sel.append(option(g.id, g.nombre || g.anioIngreso)));
        if (previa) sel.value = previa;
    }

    // -----------------------------------------------------------------
    // Paso 1: buscar en la base de la universidad
    // -----------------------------------------------------------------
    async function buscar() {
        const texto = el("gasClaves").value;
        const claves = [...new Set(texto.split(/[\s,;]+/).filter(Boolean))];
        const malas = claves.filter(c => !CLAVE.test(c));
        const buenas = claves.filter(c => CLAVE.test(c)).map(Number);
        if (!buenas.length) { mostrarError(new Error("Escribe al menos una clave de 6 cifras.")); return; }
        el("gasMessage").textContent = "";

        const r = await gasApi("/api/alumnos/busqueda-externa", "POST", { claves: buenas });
        filas = r.encontrados.map(externo => ({
            externo,
            // Solo se preselecciona lo que la universidad reporta como elegible y que
            // no se haya importado ya: el coordinador puede marcar el resto a mano.
            seleccionado: externo.elegible && !externo.yaImportado,
            datos: null, resultado: null
        }));
        const avisos = [];
        if (r.noEncontrados.length) avisos.push(`No existen en la universidad: ${r.noEncontrados.join(", ")}.`);
        if (malas.length) avisos.push(`No son claves de 6 cifras y se ignoraron: ${malas.join(", ")}.`);
        el("gasPendientes").textContent = avisos.join(" ");
        guardarLocal();
        pintarFilas();
    }

    // -----------------------------------------------------------------
    // Paso 2: tabla de resultados
    // -----------------------------------------------------------------
    function pintarFilas() {
        const body = el("gasRows"); body.replaceChildren();
        for (const fila of filas) {
            const e = fila.externo, tr = document.createElement("tr");

            const tdSel = document.createElement("td"), check = document.createElement("input");
            check.type = "checkbox"; check.checked = fila.seleccionado;
            check.onchange = () => { fila.seleccionado = check.checked; guardarLocal(); actualizarBoton(); };
            tdSel.append(check); tr.append(tdSel);

            const nombre = [e.nombre, e.apellidoPaterno, e.apellidoMaterno].filter(Boolean).join(" ");
            const situacion = e.yaImportado ? "Ya importado"
                : e.motivo ? e.motivo
                : e.correoEnUso ? "Su correo ya tiene cuenta" : "Listo";
            // textContent en todas las celdas: estos nombres vienen de otra base de
            // datos y no son contenido de confianza.
            [e.claveAlumno, nombre, e.correoInstitucional, e.estatus || "—", situacion,
             fila.datos ? "Completo" : "Pendiente"].forEach(texto => {
                const td = document.createElement("td"); td.textContent = texto; tr.append(td);
            });

            const tdAcc = document.createElement("td"), boton = document.createElement("button");
            boton.textContent = fila.datos ? "Editar datos" : "Completar";
            boton.onclick = () => completar(e.claveAlumno);
            tdAcc.append(boton); tr.append(tdAcc);
            body.append(tr);
        }
        actualizarBoton();
    }

    function actualizarBoton() {
        const listos = filas.filter(f => f.seleccionado && f.datos).length;
        const boton = el("gasImportar");
        boton.disabled = listos === 0;
        boton.textContent = listos ? `Importar seleccionados (${listos})` : "Importar seleccionados";
        const faltan = filas.filter(f => f.seleccionado && !f.datos).length;
        if (faltan) el("gasMessage").textContent = `Faltan datos de ${faltan} alumno(s) seleccionado(s).`;
    }

    // -----------------------------------------------------------------
    // Diálogo de completado
    // -----------------------------------------------------------------
    function completar(clave) {
        editando = clave;
        const f = el("gasFormAlumno"); f.reset();
        el("gasFormMessage").textContent = "";
        const manual = clave === "manual";
        const fila = manual ? null : filas.find(x => x.externo.claveAlumno === clave);

        el("gasTituloAlumno").textContent = manual
            ? "Registrar un alumno manualmente"
            : `Completar datos de ${fila.externo.nombre} ${fila.externo.apellidoPaterno}`;

        // En la importación los cinco campos de identidad son de solo lectura: el
        // servidor los relee de la universidad y descarta lo que mande el cliente.
        const identidad = el("gasIdentidad");
        identidad.querySelectorAll("input").forEach(i => { i.readOnly = !manual; });
        if (!manual) {
            const e = fila.externo;
            f.elements.claveAlumno.value = e.claveAlumno;
            f.elements.nombre.value = e.nombre;
            f.elements.apellidoPaterno.value = e.apellidoPaterno;
            f.elements.apellidoMaterno.value = e.apellidoMaterno || "";
            f.elements.correoInstitucional.value = e.correoInstitucional;
        }

        // Predefinidos visibles y editables, no decisiones ocultas.
        const datos = fila?.datos ?? ultimo ?? {};
        f.elements.fechaIngreso.value = datos.fechaIngreso || new Date().toISOString().slice(0, 10);
        f.elements.programaId.value = datos.programaId || catalogos.programas[0]?.id || "";
        filtrarGeneraciones();
        f.elements.generacionId.value = datos.generacionId || "";
        f.elements.periodoId.value = datos.periodoId || catalogos.periodos[0]?.id || "";
        f.elements.semestre.value = datos.semestre || 1;
        f.elements.modalidadId.value = datos.modalidadId || catalogos.modalidades[0]?.id || "";
        f.elements.estadoAcademicoId.value = datos.estadoAcademicoId || catalogos.estados[0]?.id || "";
        f.elements.correoPersonal.value = fila?.datos?.correoPersonal || "";
        f.elements.telefono.value = fila?.datos?.telefono || "";
        f.elements.activo.value = String(datos.activo ?? true);

        el("gasDialogAlumno").showModal();
    }

    function copiarDelAnterior() {
        if (!ultimo) { el("gasFormMessage").textContent = "Todavía no has completado ningún alumno en esta sesión."; return; }
        const f = el("gasFormAlumno");
        f.elements.fechaIngreso.value = ultimo.fechaIngreso;
        f.elements.programaId.value = ultimo.programaId;
        filtrarGeneraciones();
        f.elements.generacionId.value = ultimo.generacionId;
        f.elements.periodoId.value = ultimo.periodoId;
        f.elements.semestre.value = ultimo.semestre;
        f.elements.modalidadId.value = ultimo.modalidadId;
        f.elements.estadoAcademicoId.value = ultimo.estadoAcademicoId;
        f.elements.activo.value = String(ultimo.activo);
        el("gasFormMessage").textContent = "Copiado. Revisa el correo personal y el teléfono, que son de cada alumno.";
    }

    function leerDatos(f) {
        return {
            fechaIngreso: f.elements.fechaIngreso.value,
            programaId: Number(f.elements.programaId.value),
            generacionId: Number(f.elements.generacionId.value),
            modalidadId: Number(f.elements.modalidadId.value),
            estadoAcademicoId: Number(f.elements.estadoAcademicoId.value),
            periodoId: Number(f.elements.periodoId.value),
            semestre: Number(f.elements.semestre.value),
            correoPersonal: f.elements.correoPersonal.value.trim(),
            telefono: f.elements.telefono.value.trim(),
            activo: f.elements.activo.value === "true"
        };
    }

    async function guardarCompletado(ev) {
        ev.preventDefault();
        const f = ev.target, boton = f.querySelector('[type="submit"]');
        const datos = leerDatos(f);

        if (editando === "manual") {
            // El alta manual sí viaja sola y de inmediato: no hay lote que esperar.
            boton.disabled = true;
            try {
                const r = await gasApi("/api/alumnos", "POST", {
                    claveAlumno: Number(f.elements.claveAlumno.value),
                    nombre: f.elements.nombre.value.trim(),
                    apellidoPaterno: f.elements.apellidoPaterno.value.trim(),
                    apellidoMaterno: f.elements.apellidoMaterno.value.trim() || null,
                    correoInstitucional: f.elements.correoInstitucional.value.trim(),
                    datos
                });
                ultimo = datos;
                el("gasDialogAlumno").close();
                pintarCredenciales([{ claveAlumno: r.claveAlumno, correo: f.elements.correoInstitucional.value.trim(),
                    estado: "importado", passwordInicial: r.passwordInicial, mensaje: r.mensaje }]);
            }
            catch (e) { el("gasFormMessage").textContent = e.message; }
            finally { boton.disabled = false; }
            return;
        }

        // En la importación el completado se queda en memoria: una sola petición al final.
        const fila = filas.find(x => x.externo.claveAlumno === editando);
        fila.datos = datos;
        fila.seleccionado = true;
        ultimo = datos;
        el("gasDialogAlumno").close();
        guardarLocal();
        pintarFilas();

        // "Guardar y siguiente": encadena las filas pendientes sin volver a la tabla.
        const siguiente = filas.find(x => x.seleccionado && !x.datos && !x.externo.yaImportado);
        if (siguiente) completar(siguiente.externo.claveAlumno);
    }

    // -----------------------------------------------------------------
    // Paso 3: importar y entregar credenciales
    // -----------------------------------------------------------------
    async function importar() {
        const listas = filas.filter(f => f.seleccionado && f.datos);
        if (!listas.length) return;
        const boton = el("gasImportar"); boton.disabled = true;
        el("gasMessage").textContent = "";
        try {
            const r = await gasApi("/api/alumnos/importacion", "POST", {
                alumnos: listas.map(f => ({ claveAlumno: f.externo.claveAlumno, datos: f.datos }))
            });
            for (const res of r.resultados) {
                const fila = filas.find(x => x.externo.claveAlumno === res.claveAlumno);
                if (fila) fila.resultado = res;
            }
            // Los importados salen de la tabla: ya no son candidatos.
            filas = filas.filter(f => f.resultado?.estado !== "importado");
            guardarLocal();
            pintarFilas();
            el("gasMessage").textContent = `${r.importados} importado(s), ${r.fallidos} con error.`;
            pintarCredenciales(r.resultados);
        }
        finally { boton.disabled = false; }
    }

    function pintarCredenciales(resultados) {
        const zona = el("gasResultado"); zona.replaceChildren();
        const conClave = resultados.filter(r => r.passwordInicial);
        const errores = resultados.filter(r => r.estado === "error");

        if (conClave.length) {
            const aviso = document.createElement("p");
            aviso.textContent = "Estas contraseñas se muestran una sola vez. Entrégalas por un medio seguro; cada alumno deberá cambiarla al iniciar sesión.";
            const tabla = document.createElement("table");
            const thead = document.createElement("thead"), trh = document.createElement("tr");
            ["Clave", "Correo", "Contraseña inicial"].forEach(t => { const th = document.createElement("th"); th.textContent = t; trh.append(th); });
            thead.append(trh); tabla.append(thead);
            const tbody = document.createElement("tbody");
            conClave.forEach(r => {
                const tr = document.createElement("tr");
                [r.claveAlumno, r.correo, r.passwordInicial].forEach(t => { const td = document.createElement("td"); td.textContent = t; tr.append(td); });
                tbody.append(tr);
            });
            tabla.append(tbody);

            const texto = conClave.map(r => `${r.claveAlumno}\t${r.correo}\t${r.passwordInicial}`).join("\n");
            const copiar = document.createElement("button");
            copiar.textContent = "Copiar credenciales";
            copiar.onclick = async () => {
                try { await navigator.clipboard.writeText("Clave\tCorreo\tContraseña\n" + texto); copiar.textContent = "Copiado"; }
                catch { copiar.textContent = "No se pudo copiar; usa el CSV"; }
            };
            const descargar = document.createElement("button");
            descargar.textContent = "Descargar CSV";
            descargar.onclick = () => {
                const csv = "clave,correo,password\n" + conClave.map(r => `${r.claveAlumno},${r.correo},${r.passwordInicial}`).join("\n");
                const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
                const a = document.createElement("a"); a.href = url; a.download = "credenciales-alumnos.csv"; a.click();
                URL.revokeObjectURL(url);
            };
            zona.append(aviso, tabla, copiar, descargar);
        }

        if (errores.length) {
            const lista = document.createElement("ul");
            errores.forEach(r => { const li = document.createElement("li"); li.textContent = `${r.claveAlumno}: ${r.mensaje}`; lista.append(li); });
            const titulo = document.createElement("p"); titulo.textContent = "No se pudieron importar:";
            zona.append(titulo, lista);
        }
    }

    // -----------------------------------------------------------------
    // Persistencia local del lote a medio completar
    //
    // La sesión caduca a los 15 minutos de inactividad real, así que completar
    // 20 alumnos puede cruzar ese límite. Esto permite reanudar al volver a
    // entrar. No se usa un temporizador para mantener la sesión viva: sesion.js
    // dice explícitamente que solo la actividad humana debe renovarla.
    // -----------------------------------------------------------------
    function guardarLocal() {
        try { sessionStorage.setItem("gas.importacion", JSON.stringify(filas)); } catch { /* modo privado */ }
    }
    function restaurar() {
        if (filas.length) return;
        try {
            const guardado = sessionStorage.getItem("gas.importacion");
            if (guardado) filas = JSON.parse(guardado) || [];
        } catch { filas = []; }
    }

    // -----------------------------------------------------------------
    // Consulta de alumnos
    // -----------------------------------------------------------------
    async function abrirListado() {
        const me = await gasSession;
        if (me.requiereCambio) return;
        await cargarCatalogos();
        // Criterios de RF-01.2. Faltan estado del requisito TOEFL, estado de tesis y
        // porcentaje de avance: dependen de las tablas `requisito_toefl` y `tesis`,
        // que son RF-01.6 y RF-01.8 y hoy están vacías.
        area.innerHTML = `<section class="gas-panel"><h2>Consultar alumnos</h2>
        <div class="toolbar">
        <label>Buscar por clave, nombre, apellidos o correo<input id="gasBuscarAlumno" type="search"></label>
        <label>Generación<select id="gasFGeneracion"><option value="">Todas</option></select></label>
        <label>Semestre<select id="gasFSemestre"><option value="">Todos</option></select></label>
        <label>Estado académico<select id="gasFEstadoAcad"><option value="">Todos</option></select></label>
        <label>Modalidad<select id="gasFModalidad"><option value="">Todas</option></select></label>
        <label>Activo<select id="gasEstadoAlumno"><option value="">Todos</option><option value="true">Sí</option><option value="false">No</option></select></label>
        <button id="gasFiltrarAlumno">Buscar</button><button id="gasLimpiarAlumno">Limpiar</button></div>
        <p id="gasMessage" class="error" role="status"></p>
        <div class="table-scroll"><table><thead><tr><th>Clave</th><th>Nombre</th><th>Correo institucional</th><th>Generación</th><th>Sem.</th><th>Estado académico</th><th>Modalidad</th><th>Activo</th><th></th></tr></thead><tbody id="gasRowsAlumno"></tbody></table></div>
        <button id="gasPrevAlumno">Anterior</button><span id="gasCountAlumno"></span><button id="gasNextAlumno">Siguiente</button>
        ${plantillaDialogo()}</section>`;

        catalogos.generaciones.forEach(g => el("gasFGeneracion").append(option(g.id, g.nombre || g.anioIngreso)));
        catalogos.estados.forEach(e => el("gasFEstadoAcad").append(option(e.id, e.nombre)));
        catalogos.modalidades.forEach(m => el("gasFModalidad").append(option(m.id, m.nombre)));
        for (let i = 1; i <= 8; i++) el("gasFSemestre").append(option(i, i));

        poblarSelects();
        el("gasCopiarAnterior").style.display = "none";   // no aplica al editar
        el("gasCancelar").onclick = () => el("gasDialogAlumno").close();
        el("gasFormAlumno").onsubmit = guardarEdicion;
        el("gasFiltrarAlumno").onclick = () => { pagina = 1; listar().catch(mostrarError); };
        el("gasLimpiarAlumno").onclick = () => {
            ["gasBuscarAlumno", "gasFGeneracion", "gasFSemestre", "gasFEstadoAcad", "gasFModalidad", "gasEstadoAlumno"]
                .forEach(id => { el(id).value = ""; });
            pagina = 1; listar().catch(mostrarError);
        };
        el("gasBuscarAlumno").onkeydown = e => { if (e.key === "Enter") { pagina = 1; listar().catch(mostrarError); } };
        el("gasPrevAlumno").onclick = () => { pagina--; listar().catch(mostrarError); };
        el("gasNextAlumno").onclick = () => { pagina++; listar().catch(mostrarError); };
        await listar();
    }

    // RF-01.3: edición de un alumno ya registrado. Reutiliza el mismo diálogo del
    // alta; la diferencia es que la identidad nunca es editable aquí.
    function editarAlumno(a) {
        editando = { clave: a.claveAlumno, modo: "editar" };
        const f = el("gasFormAlumno"); f.reset();
        el("gasFormMessage").textContent = "";
        el("gasTituloAlumno").textContent = `Editar a ${a.nombre} ${a.apellidoPaterno}`;
        el("gasIdentidad").querySelectorAll("input").forEach(i => { i.readOnly = true; });
        f.elements.claveAlumno.value = a.claveAlumno;
        f.elements.nombre.value = a.nombre || "";
        f.elements.apellidoPaterno.value = a.apellidoPaterno || "";
        f.elements.apellidoMaterno.value = a.apellidoMaterno || "";
        f.elements.correoInstitucional.value = a.correoInstitucional || "";
        f.elements.correoInstitucional.readOnly = false;   // RF-01.3 sí permite cambiarlo
        f.elements.fechaIngreso.value = (a.fechaIngreso || "").slice(0, 10);
        f.elements.fechaIngreso.disabled = true;           // no es campo actualizable
        f.elements.programaId.value = a.programaId || "";
        filtrarGeneraciones();
        f.elements.generacionId.value = a.generacionId || "";
        f.elements.periodoId.value = a.periodoId || catalogos.periodos[0]?.id || "";
        f.elements.semestre.value = a.semestre || 1;
        f.elements.modalidadId.value = a.modalidadId || "";
        f.elements.estadoAcademicoId.value = a.estadoAcademicoId || "";
        f.elements.correoPersonal.value = a.correoPersonal || "";
        f.elements.telefono.value = a.telefono || "";
        f.elements.activo.value = String(a.activo);
        el("gasDialogAlumno").showModal();
    }

    async function guardarEdicion(ev) {
        ev.preventDefault();
        const f = ev.target, boton = f.querySelector('[type="submit"]');
        boton.disabled = true;
        try {
            await gasApi("/api/alumnos/" + editando.clave, "PUT", {
                correoInstitucional: f.elements.correoInstitucional.value.trim(),
                correoPersonal: f.elements.correoPersonal.value.trim(),
                telefono: f.elements.telefono.value.trim(),
                semestre: Number(f.elements.semestre.value),
                periodoId: Number(f.elements.periodoId.value),
                estadoAcademicoId: Number(f.elements.estadoAcademicoId.value),
                modalidadId: Number(f.elements.modalidadId.value),
                generacionId: Number(f.elements.generacionId.value),
                activo: f.elements.activo.value === "true"
            });
            el("gasDialogAlumno").close();
            await listar();
        }
        catch (e) { el("gasFormMessage").textContent = e.message; }
        finally { boton.disabled = false; }
    }

    async function listar() {
        const query = new URLSearchParams({ pagina: String(pagina) });
        for (const [id, clave] of [["gasBuscarAlumno", "buscar"], ["gasFGeneracion", "generacionId"],
            ["gasFSemestre", "semestre"], ["gasFEstadoAcad", "estadoAcademicoId"],
            ["gasFModalidad", "modalidadId"], ["gasEstadoAlumno", "activo"]]) {
            const valor = el(id)?.value; if (valor) query.set(clave, valor);
        }
        const r = await gasApi("/api/alumnos?" + query);
        const body = el("gasRowsAlumno"); body.replaceChildren();
        for (const a of r.alumnos) {
            const tr = document.createElement("tr");
            [a.claveAlumno, [a.nombre, a.apellidoPaterno, a.apellidoMaterno].filter(Boolean).join(" "),
             a.correoInstitucional || "—", a.generacion || "—", a.semestre ?? "—",
             a.estadoAcademico || "—", a.modalidad || "—", a.activo ? "Sí" : "No"]
                .forEach(t => { const td = document.createElement("td"); td.textContent = t; tr.append(td); });
            const acc = document.createElement("td"), b = document.createElement("button");
            b.textContent = "Editar"; b.onclick = () => editarAlumno(a);
            acc.append(b); tr.append(acc); body.append(tr);
        }
        el("gasCountAlumno").textContent = `${r.total} alumnos · Página ${pagina}`;
        el("gasPrevAlumno").disabled = pagina <= 1;
        el("gasNextAlumno").disabled = pagina * r.tamano >= r.total;
        el("gasMessage").textContent = r.total ? "" : "Sin resultados.";
    }

    // Igual que usuarios.js: fase de captura y stopImmediatePropagation para anular
    // los listeners de maqueta de coordinador.js sin modificarlo.
    // A diferencia de usuarios.js, este módulo NO se autoarranca: el último script
    // que pinte contentArea al cargar gana, y pisaría el panel de usuarios.
    el("agregarAlumnoButton")?.addEventListener("click", e => {
        e.stopImmediatePropagation(); abrirImportacion().catch(mostrarError);
    }, true);
    el("consultarAlumnoButton")?.addEventListener("click", e => {
        e.stopImmediatePropagation(); abrirListado().catch(mostrarError);
    }, true);
})();
