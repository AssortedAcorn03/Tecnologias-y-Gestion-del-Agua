const form = document.querySelector(".card-body");
const button = document.querySelector(".login-button");
const message = document.createElement("p"); message.setAttribute("role", "status"); form.append(message);
if (new URLSearchParams(location.search).has("motivo")) message.textContent = "Tu sesión terminó. Inicia sesión de nuevo.";
async function login() {
    button.disabled = true; message.textContent = "Verificando…";
    try {
        const result = await gasApi("/api/auth/login", "POST", { correo: document.getElementById("usuario").value.trim(), password: document.getElementById("password").value });
        location.href = result.requiereCambio ? "/cuenta.html" : ["Administrador", "Coordinador"].includes(result.rol) ? "/coordinador.html" : "/cuenta.html";
    } catch (error) { message.textContent = error.message; } finally { button.disabled = false; }
}
button.addEventListener("click", login);
document.getElementById("password").addEventListener("keydown", e => { if (e.key === "Enter") login(); });
