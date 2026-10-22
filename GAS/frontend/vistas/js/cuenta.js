gasSession.then(me => {
    document.getElementById("identidad").textContent = `${me.correo} · ${me.rol}`;
    document.getElementById("aviso").textContent = me.requiereCambio ? "Cambia tu contraseña inicial para continuar." : "Puedes actualizar tu contraseña aquí.";
    const panel = document.getElementById("panel");
    panel.hidden = me.requiereCambio || !["Administrador", "Coordinador", "Alumno", "Profesor"].includes(me.rol);
    panel.textContent = "Abrir mi panel";
    panel.href = me.rol === "Alumno" ? "/alumno.html" : me.rol === "Profesor" ? "/maestros.html" : "/coordinador.html";
}).catch(() => {});
document.getElementById("cambiar").addEventListener("submit", async e => {
    e.preventDefault(); const message = document.getElementById("mensaje"), button = e.target.querySelector("button");
    if (document.getElementById("nueva").value !== document.getElementById("confirmacion").value) { message.textContent = "Las contraseñas no coinciden."; return; }
    button.disabled = true;
    try {
        const result = await gasApi("/api/auth/cambiar-password", "POST", {
            actual: document.getElementById("actual").value,
            nueva: document.getElementById("nueva").value
        });
        e.target.reset();
        message.textContent = "Contraseña actualizada. Abriendo tu inicio…";
        // Compatibilidad si aún se está ejecutando el backend anterior.
        if (!result.rol) { location.replace("/login.html?motivo=cambio"); return; }
        location.replace(result.rol === "Alumno" ? "/alumno.html"
            : result.rol === "Profesor" ? "/maestros.html"
            : ["Administrador", "Coordinador"].includes(result.rol) ? "/coordinador.html" : "/cuenta.html");
    }
    catch (error) { message.textContent = error.message; } finally { button.disabled = false; }
});
