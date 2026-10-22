// LOGIN-ALUMNO-V4
const form = document.querySelector(".card-body");
const button = document.querySelector(".login-button");
const message = document.createElement("p");
message.setAttribute("role", "status");
form.append(message);
async function login() {
    if (button.disabled) return;
    button.disabled = true;
    message.textContent = "Verificando…";
    try {
        await gasApi("/api/auth/login", "POST", {
            correo: document.getElementById("usuario").value.trim(),
            password: document.getElementById("password").value
        });
        const sesion = await gasApi("/api/auth/me");
        if (sesion.requiereCambio === true) {
            location.replace("/cuenta.html");
            return;
        }
        const paginas = { alumno: "/alumno.html", profesor: "/maestros.html",
            administrador: "/coordinador.html", coordinador: "/coordinador.html" };
        const destino = paginas[String(sesion.rol || "").trim().toLowerCase()];
        if (!destino) throw new Error("Rol no reconocido: " + sesion.rol);
        location.replace(destino);
    } catch (error) { message.textContent = error.message; }
    finally { button.disabled = false; }
}
button.addEventListener("click", login);
document.getElementById("password").addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); login(); }
});
