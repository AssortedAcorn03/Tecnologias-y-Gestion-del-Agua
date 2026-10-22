gasSession.then(me => {
    document.getElementById("identidad").textContent = `${me.correo} · ${me.rol}`;
    document.getElementById("aviso").textContent = me.requiereCambio ? "Cambia tu contraseña inicial para continuar." : "Puedes actualizar tu contraseña aquí.";
    // Vuelta al panel propio. Antes apuntaba fijo a coordinador.html y solo se
    // mostraba a administradores y coordinadores, así que para los demás roles
    // cuenta.html era un callejón sin salida: solo quedaba cerrar sesión.
    // Se oculta mientras el cambio de contraseña sea obligatorio, que es cuando
    // de verdad no debe poder salir de aquí.
    const PANEL = {
        Administrador: "/coordinador.html",
        Coordinador:   "/coordinador.html",
        Alumno:        "/alumno.html",
        Egresado:      "/egresados.html",
        Profesor:      "/maestros.html"
    };
    const panel = document.getElementById("panel");
    const destino = PANEL[me.rol];
    panel.hidden = me.requiereCambio || !destino;
    if (destino) { panel.href = destino; panel.textContent = "Volver a mi panel"; }
}).catch(() => {});
document.getElementById("cambiar").addEventListener("submit", async e => {
    e.preventDefault(); const message = document.getElementById("mensaje"), button = e.target.querySelector("button");
    if (document.getElementById("nueva").value !== document.getElementById("confirmacion").value) { message.textContent = "Las contraseñas no coinciden."; return; }
    button.disabled = true;
    try { await gasApi("/api/auth/cambiar-password", "POST", { actual: document.getElementById("actual").value, nueva: document.getElementById("nueva").value }); location.href = "/login.html?motivo=cambio"; }
    catch (error) { message.textContent = error.message; } finally { button.disabled = false; }
});
