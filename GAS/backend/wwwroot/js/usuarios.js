(() => {
    let roles = [], page = 1, currentId = null;
    const area = document.getElementById("contentArea");
    function option(value, text) { const o = document.createElement("option"); o.value = value; o.textContent = text; return o; }
    async function openUsers(create = false) {
        const me = await gasSession;
        if (me.requiereCambio) return;
        area.innerHTML = `<section class="gas-panel"><h2>Administración de usuarios</h2><p>Las bajas conservan el registro. Cambiar correo, rol o estado cierra las sesiones anteriores.</p>
        <div class="toolbar"><label>Buscar por ID, nombre, correo o clave<input id="gasSearch" type="search"></label><label>Rol<select id="gasRole"><option value="">Todos</option></select></label><label>Estado<select id="gasState"><option value="">Todos</option><option value="true">Activo</option><option value="false">Inactivo</option></select></label><button id="gasFilter">Buscar</button><button id="gasNew">Nuevo usuario</button><a href="cuenta.html">Mi cuenta</a></div>
        <p id="gasMessage" class="error" role="status"></p><div class="table-scroll"><table><thead><tr><th>ID / clave</th><th>Nombre y correo</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead><tbody id="gasRows"></tbody></table></div><button id="gasPrev">Anterior</button><span id="gasCount"></span><button id="gasNext">Siguiente</button>
        <dialog id="gasDialog"><h3 id="gasTitle"></h3><form id="gasForm"><label>Nombre asociado<input name="nombre" required maxlength="150"></label><label>Clave institucional (opcional)<input name="claveInstitucional" maxlength="30" pattern="[A-Za-z0-9_-]+"></label><label>Correo electrónico<input name="correo" type="email" required maxlength="100"></label><label>Rol<select name="rolId" required></select></label><label>Estado<select name="activo"><option value="true">Activo</option><option value="false">Inactivo</option></select></label><label id="gasPasswordLabel">Contraseña inicial (12 a 128 caracteres, letras y números)<input name="password" type="password" minlength="12" maxlength="128" autocomplete="new-password"></label><p id="gasFormMessage" class="error" role="status"></p><div><button type="submit">Guardar</button><button type="button" id="gasCancel">Cancelar</button></div></form></dialog></section>`;
        roles = await gasApi("/api/roles");
        roles.forEach(r => { document.getElementById("gasRole").append(option(r.id, r.nombre)); document.getElementById("gasForm").elements.rolId.append(option(r.id, r.nombre)); });
        document.getElementById("gasFilter").onclick = () => { page = 1; load().catch(showError); };
        document.getElementById("gasSearch").onkeydown = e => { if (e.key === "Enter") { page = 1; load().catch(showError); } };
        document.getElementById("gasNew").onclick = () => edit();
        document.getElementById("gasCancel").onclick = () => document.getElementById("gasDialog").close();
        document.getElementById("gasPrev").onclick = () => { page--; load().catch(showError); };
        document.getElementById("gasNext").onclick = () => { page++; load().catch(showError); };
        document.getElementById("gasForm").onsubmit = save;
        await load(); if (create) edit();
    }
    function showError(e) { const el = document.getElementById("gasMessage"); if (el) el.textContent = e.message; }
    async function load() {
        const query = new URLSearchParams({ pagina: String(page) });
        for (const [id, key] of [["gasSearch", "buscar"], ["gasRole", "rolId"], ["gasState", "activo"]]) {
            const value = document.getElementById(id).value; if (value) query.set(key, value);
        }
        const result = await gasApi("/api/usuarios?" + query);
        const body = document.getElementById("gasRows"); body.replaceChildren();
        for (const u of result.usuarios) {
            const row = document.createElement("tr");
            [u.id + " / " + (u.claveInstitucional || "—"), (u.nombre || "Sin nombre") + " · " + u.correo, u.rol || "Sin rol", u.activo ? "Activo" : "Inactivo"].forEach(text => { const cell = document.createElement("td"); cell.textContent = text; row.append(cell); });
            const actions = document.createElement("td"), editButton = document.createElement("button");
            editButton.textContent = "Editar / rol"; editButton.onclick = () => edit(u); actions.append(editButton);
            if (u.activo) {
                const deactivate = document.createElement("button"); deactivate.textContent = "Dar de baja";
                deactivate.onclick = async () => {
                    if (!confirm(`¿Desactivar a ${u.correo}? Su información se conservará.`)) return;
                    deactivate.disabled = true;
                    try { await gasApi("/api/usuarios/" + u.id, "DELETE"); await load(); }
                    catch (e) { showError(e); deactivate.disabled = false; }
                }; actions.append(deactivate);
            }
            row.append(actions); body.append(row);
        }
        document.getElementById("gasCount").textContent = `${result.total} usuarios · Página ${page}`;
        document.getElementById("gasPrev").disabled = page <= 1;
        document.getElementById("gasNext").disabled = page * result.tamano >= result.total;
        document.getElementById("gasMessage").textContent = result.total ? "" : "Sin resultados.";
    }
    function edit(u) {
        const form = document.getElementById("gasForm"); form.reset(); currentId = u?.id ?? null;
        document.getElementById("gasTitle").textContent = u ? "Editar usuario y asignar rol" : "Alta de usuario";
        document.getElementById("gasFormMessage").textContent = "";
        form.elements.password.required = !u; document.getElementById("gasPasswordLabel").style.display = u ? "none" : "grid";
        if (u) {
            for (const key of ["nombre", "claveInstitucional", "correo", "rolId"]) form.elements[key].value = u[key] ?? "";
            form.elements.activo.value = String(u.activo);
        }
        document.getElementById("gasDialog").showModal();
    }
    async function save(e) {
        e.preventDefault(); const f = e.target, button = f.querySelector('[type="submit"]'); button.disabled = true;
        const data = { nombre: f.elements.nombre.value.trim(), claveInstitucional: f.elements.claveInstitucional.value.trim() || null,
            correo: f.elements.correo.value.trim(), rolId: Number(f.elements.rolId.value), activo: f.elements.activo.value === "true", password: currentId ? null : f.elements.password.value };
        try { await gasApi("/api/usuarios" + (currentId ? "/" + currentId : ""), currentId ? "PUT" : "POST", data); document.getElementById("gasDialog").close(); await load(); }
        catch (error) { document.getElementById("gasFormMessage").textContent = error.message; }
        finally { button.disabled = false; }
    }
    // Reemplaza solo las acciones de usuarios del prototipo, conservando los módulos académicos.
    [["altaUsuarioButton", true], ["listadoUsuariosButton", false]].forEach(([id, create]) => document.getElementById(id).addEventListener("click", e => {
        e.stopImmediatePropagation(); openUsers(create).catch(showError);
    }, true));
    openUsers().catch(showError);
})();
