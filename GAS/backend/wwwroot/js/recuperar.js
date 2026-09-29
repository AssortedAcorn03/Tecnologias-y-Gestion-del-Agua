const token = new URLSearchParams(location.hash.slice(1)).get("token");
history.replaceState(null, "", location.pathname);
const recover = document.getElementById("recuperar"), reset = document.getElementById("restablecer"), statusText = document.getElementById("mensaje");
recover.hidden = !!token; reset.hidden = !token;
// hidden debe prevalecer sobre display:grid de los formularios.
recover.style.display = token ? "none" : "grid"; reset.style.display = token ? "grid" : "none";
async function submit(event, path, data) {
    event.preventDefault(); const button = event.target.querySelector("button"); button.disabled = true;
    try { const r = await gasApi(path, "POST", data); statusText.textContent = r.mensaje; }
    catch (error) { statusText.textContent = error.message; } finally { button.disabled = false; }
}
recover.addEventListener("submit", e => submit(e, "/api/auth/recuperar", { correo: document.getElementById("correo").value.trim() }));
reset.addEventListener("submit", e => {
    if (document.getElementById("nueva").value !== document.getElementById("confirmacion").value) { e.preventDefault(); statusText.textContent = "Las contraseñas no coinciden."; return; }
    submit(e, "/api/auth/restablecer", { token, password: document.getElementById("nueva").value });
});
