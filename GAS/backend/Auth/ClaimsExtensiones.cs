using System.Security.Claims;

namespace backend.Auth;

/// <summary>
/// Atajos de lectura sobre el <see cref="ClaimsPrincipal"/>.
///
/// Comodidad, no arquitectura: evitan repetir
/// `User.FindFirst(ClaimsGas.IdUsuario)!.Value` en cada endpoint.
/// </summary>
public static class ClaimsExtensiones
{
    /// <summary>
    /// Identificador del usuario autenticado, o <c>null</c> si no hay sesión
    /// o el claim no viene. Devuelve nullable a propósito: un endpoint público
    /// puede consultarlo sin reventar.
    /// </summary>
    public static int? IdUsuario(this ClaimsPrincipal user)
    {
        var valor = user.FindFirst(ClaimsGas.IdUsuario)?.Value;
        return int.TryParse(valor, out var id) ? id : null;
    }

    /// <summary>
    /// Identificador del usuario autenticado. Lanza si no hay sesión, así que
    /// se usa dentro de endpoints ya protegidos con <c>RequireAuthorization</c>,
    /// donde no tener sesión sería un error de programación.
    /// </summary>
    public static int IdUsuarioRequerido(this ClaimsPrincipal user) =>
        user.IdUsuario()
        ?? throw new InvalidOperationException(
            "No hay un usuario autenticado en el contexto actual.");

    /// <summary>Correo del usuario autenticado, o cadena vacía si no hay sesión.</summary>
    public static string Correo(this ClaimsPrincipal user) =>
        user.FindFirst(ClaimsGas.Correo)?.Value ?? string.Empty;

    /// <summary>Rol del usuario autenticado, o cadena vacía si no hay sesión.</summary>
    public static string Rol(this ClaimsPrincipal user) =>
        user.FindFirst(ClaimsGas.Rol)?.Value ?? string.Empty;
}
