const DESTINO = {
    Administrador: "/coordinador.html",
    Coordinador:   "/coordinador.html",
    Alumno:        "/alumno.html",
    Egresado:      "/egresados.html",
    Profesor:      "/maestros.html"
};
const form = document.querySelector(".card-body");
const button = document.querySelector(".login-button");
const message = document.createElement("p"); message.setAttribute("role", "status"); form.append(message);
if (new URLSearchParams(location.search).has("motivo")) message.textContent = "Tu sesión terminó. Inicia sesión de nuevo.";
async function login() {
    button.disabled = true; message.textContent = "Verificando…";
    try {
        const result = await gasApi("/api/auth/login", "POST", { correo: document.getElementById("usuario").value.trim(), password: document.getElementById("password").value });
        // Cada rol tiene su panel. Sin este mapa, alumnos y egresados caían siempre
        // en cuenta.html y parecía que el sistema les pedía cambiar la contraseña
        // una y otra vez, cuando en realidad era el único destino que se conocía.
        location.href = result.requiereCambio ? "/cuenta.html" : (DESTINO[result.rol] ?? "/cuenta.html");
    } catch (error) { message.textContent = error.message; } finally { button.disabled = false; }
}
button.addEventListener("click", login);
document.getElementById("password").addEventListener("keydown", e => { if (e.key === "Enter") login(); });
