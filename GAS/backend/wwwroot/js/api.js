window.gasApi = async function(path, method = "GET", data) {
    const response = await fetch(path, { method, credentials: "same-origin", headers: { "Content-Type": "application/json", "X-GAS-Request": "1" }, body: data === undefined ? undefined : JSON.stringify(data) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
        if (response.status === 401 && !path.endsWith("/login")) location.replace("/login.html?motivo=sesion");
        throw new Error(result.mensaje || result.detail || (result.errors ? Object.values(result.errors).flat().join(" ") : response.status === 429 ? "Demasiados intentos. Espera unos minutos." : "No fue posible completar la solicitud."));
    }
    return result;
};
