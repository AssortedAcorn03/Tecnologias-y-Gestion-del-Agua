using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
namespace backend.Auth;
public static class Seguridad
{
    public const int Intentos = 5, BloqueoMinutos = 15, InactividadMinutos = 15;
    public static string Token() => Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
    public static string Hash(string token) => Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
    public static bool PasswordValida(string? p) => p is { Length: >= 12 and <= 128 } && p.Any(char.IsLetter) && p.Any(char.IsDigit);

    // Alfabeto sin caracteres ambiguos (O/0, l/1/I): estas contraseñas se dictan
    // o se transcriben a mano, así que confundirlos cuesta un intento fallido.
    private const string AlfabetoInicial = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

    /// <summary>
    /// Contraseña inicial legible para una cuenta recién creada: 16 caracteres en
    /// grupos de cuatro separados por guiones. Se valida con el MISMO predicado que
    /// usa el login, así que el generador no puede producir algo que el sistema
    /// rechace. Se entrega una sola vez y la cuenta nace con requiere_cambio.
    /// </summary>
    public static string PasswordInicial() {
        while (true) {
            var c = RandomNumberGenerator.GetString(AlfabetoInicial, 16);
            var p = string.Join('-', c[..4], c[4..8], c[8..12], c[12..]);
            if (PasswordValida(p)) return p;   // en la práctica acierta al primer intento
        }
    }
    public static bool Verificar(usuario u, string p) {
        try { return new PasswordHasher<usuario>().VerifyHashedPassword(u, u.contrasena_hash, p) != PasswordVerificationResult.Failed; }
        catch (FormatException) { return false; }
    }
    public static async Task Invalidar(GasDbContext db, int id) {
        await db.Sesiones.Where(s => s.UsuarioId == id).ExecuteDeleteAsync();
        await db.token_recuperacions.Where(t => t.id_usuario == id).ExecuteUpdateAsync(s => s.SetProperty(t => t.usado, true));
    }
}
public class ValidarSesion(GasDbContext db) : CookieAuthenticationEvents
{
    public override async Task ValidatePrincipal(CookieValidatePrincipalContext context)
    {
        var sid = context.Principal?.FindFirst("sid")?.Value;
        var session = await db.Sesiones.AsNoTracking().SingleOrDefaultAsync(s => s.Id == sid);
        var u = session == null ? null : await db.usuarios.AsNoTracking().Include(u => u.id_rol_usuarioNavigation).SingleOrDefaultAsync(u => u.id_usuario == session.UsuarioId);
        var now = DateTime.UtcNow;
        if (session == null || u?.activo != true || u.id_rol_usuarioNavigation?.activo != true ||
            u.bloqueado_hasta > now || session.UltimaActividad <= now.AddMinutes(-Seguridad.InactividadMinutos) ||
            session.Creada <= now.AddHours(-8) || u.id_rol_usuarioNavigation.nombre != context.Principal!.Rol())
        {
            context.RejectPrincipal();
            await context.HttpContext.SignOutAsync();
            if (session != null) await db.Sesiones.Where(s => s.Id == sid).ExecuteDeleteAsync();
        }
    }
    public override Task RedirectToLogin(RedirectContext<CookieAuthenticationOptions> c) { c.Response.StatusCode = 401; return Task.CompletedTask; }
    public override Task RedirectToAccessDenied(RedirectContext<CookieAuthenticationOptions> c) { c.Response.StatusCode = 403; return Task.CompletedTask; }
}
