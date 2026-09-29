gasSession.then(me => {
    document.getElementById("identidad").textContent = `${me.correo} · ${me.rol}`;
    document.getElementById("aviso").textContent = me.requiereCambio ? "Cambia tu contraseña inicial para continuar." : "Puedes actualizar tu contraseña aquí.";
    document.getElementById("panel").hidden = me.requiereCambio || !["Administrador", "Coordinador"].includes(me.rol);
}).catch(() => {});
document.getElementById("cambiar").addEventListener("submit", async e => {
    e.preventDefault(); const message = document.getElementById("mensaje"), button = e.target.querySelector("button");
    if (document.getElementById("nueva").value !== document.getElementById("confirmacion").value) { message.textContent = "Las contraseñas no coinciden."; return; }
    button.disabled = true;
    try { await gasApi("/api/auth/cambiar-password", "POST", { actual: document.getElementById("actual").value, nueva: document.getElementById("nueva").value }); location.href = "/login.html?motivo=cambio"; }
    catch (error) { message.textContent = error.message; } finally { button.disabled = false; }
});
