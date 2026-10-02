window.gasSession = (async () => {
    const me = await gasApi("/api/auth/me");
    if (me.requiereCambio && !location.pathname.endsWith("/cuenta.html")) { location.replace("/cuenta.html"); return me; }
    let lastActivity = Date.now(), lastSent = 0, pending = false;
    const limit = me.inactividadMinutos * 60000;
    const logout = async () => { try { await gasApi("/api/auth/logout", "POST"); } finally { location.replace("/login.html?motivo=sesion"); } };
    // Solo actividad humana renueva la sesión; el temporizador por sí solo NO la renueva.
    const activity = async () => {
        const now = Date.now();
        if (now - lastActivity >= limit) return logout();
        lastActivity = now;
        if (pending || now - lastSent < 30000) return;
        pending = true;
        try { await gasApi("/api/auth/actividad", "POST"); lastSent = now; }
        catch { /* gasApi redirige si expiró; un fallo de red no debe fabricar una sesión. */ }
        finally { pending = false; }
    };
    ["pointerdown", "pointermove", "keydown", "scroll", "touchstart"].forEach(name => document.addEventListener(name, activity, { passive: true }));
    setInterval(() => { if (Date.now() - lastActivity >= limit) logout(); }, 1000);
    document.querySelectorAll(".logout, #cerrarSesion").forEach(b => b.addEventListener("click", logout));
    return me;
})();
window.gasSession.catch(() => location.replace("/login.html"));
