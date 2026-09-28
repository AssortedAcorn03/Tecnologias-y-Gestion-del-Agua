using System.Security.Claims;

namespace backend.Auth;

/// <summary>
/// Contrato de claims del sistema.
///
/// Estos son los datos que la aplicación espera conocer de quien ha iniciado
/// sesión, sea cual sea el proveedor que lo autenticó. Hoy los emite el login
/// local; el día que la institución conecte su propio inicio de sesión
/// (Microsoft Entra ID), ese proveedor deberá emitir exactamente estos mismos
/// claims, con estos mismos nombres.
///
/// Mientras eso se cumpla, el resto del sistema no necesita cambiar ni una
/// línea: nunca pregunta CÓMO entró alguien, solo QUIÉN es y QUÉ rol tiene.
/// </summary>
public static class ClaimsGas
{
    /// <summary>
    /// Clave primaria de la tabla `usuario`. Es el identificador interno del
    /// sistema y no cambia al migrar al SSO: con Entra ID se seguirá
    /// resolviendo buscando al usuario por su correo institucional.
    /// </summary>
    public const string IdUsuario = "id_usuario";

    /// <summary>
    /// Correo del usuario (`usuario.correo`). Es la columna que casa con la
    /// identidad institucional, así que es la bisagra de la migración.
    /// </summary>
    public const string Correo = ClaimTypes.Email;

    /// <summary>
    /// Nombre del rol, tomado de `CAT_rol_usuario.nombre`.
    ///
    /// Importante: el rol SIEMPRE sale de nuestra base de datos, nunca del
    /// proveedor de identidad. La institución sabrá que alguien es
    /// `fulano@uaslp.mx`, pero no que es coordinador del posgrado.
    ///
    /// Se usa <see cref="ClaimTypes.Role"/> para que funcionen directamente
    /// `User.IsInRole(...)` y `RequireRole(...)` de ASP.NET.
    /// </summary>
    public const string Rol = ClaimTypes.Role;
}
