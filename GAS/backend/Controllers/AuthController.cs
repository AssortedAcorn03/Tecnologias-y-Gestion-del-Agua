using backend.Auth;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace backend.Controllers;
public record LoginInput([Required, EmailAddress, MaxLength(100)] string Correo, [Required, MaxLength(128)] string Password);
public record RecuperarInput([Required, EmailAddress, MaxLength(100)] string Correo);
public record RestablecerInput([Required, StringLength(64, MinimumLength = 64)] string Token, [Required, MaxLength(128)] string Password);
public record CambiarInput([Required, MaxLength(128)] string Actual, [Required, MaxLength(128)] string Nueva);

[ApiController, Route("api/auth")]
public class AuthController(GasDbContext db, CorreoRecuperacion correo, ILogger<AuthController> logger) : ControllerBase
{
    private async Task<usuario?> Bloquear(string email) => (await db.usuarios.FromSqlInterpolated($"SELECT * FROM usuario WHERE correo = {email} FOR UPDATE").ToListAsync()).SingleOrDefault();
    private async Task Registrar(usuario? u, string resultado) {
        db.log_accesos.Add(new log_acceso { id_usuario = u?.id_usuario, fecha = DateTime.UtcNow, resultado = resultado, ip = HttpContext.Connection.RemoteIpAddress?.ToString() });
        await db.SaveChangesAsync();
    }
    [HttpPost("login"), EnableRateLimiting("auth")]
    public async Task<IActionResult> Login(LoginInput input)
    {
        var email = input.Correo.Trim().ToLowerInvariant();
        await using var tx = await db.Database.BeginTransactionAsync();
        var u = await Bloquear(email);
        var now = DateTime.UtcNow;
        if (u == null) {
            await Registrar(null, "INVALIDO"); await tx.CommitAsync();
            return Unauthorized(new { mensaje = "Credenciales inválidas o cuenta no disponible." });
        }
        var rol = await db.CAT_rol_usuarios.FindAsync(u.id_rol_usuario);
        if (u.activo != true || rol?.activo != true || u.bloqueado_hasta > now) {
            await Registrar(u, "NO_DISPONIBLE"); await tx.CommitAsync();
            return Unauthorized(new { mensaje = "Credenciales inválidas o cuenta no disponible. Si hubo varios intentos, espera 15 minutos." });
        }
        if (u.bloqueado_hasta != null) { u.intentos_fallidos = 0; u.bloqueado_hasta = null; }
        if (!Seguridad.Verificar(u, input.Password)) {
            u.intentos_fallidos = (u.intentos_fallidos ?? 0) + 1;
            if (u.intentos_fallidos >= Seguridad.Intentos) {
                u.bloqueado_hasta = now.AddMinutes(Seguridad.BloqueoMinutos);
                await Seguridad.Invalidar(db, u.id_usuario);
            }
            await Registrar(u, "INVALIDO"); await tx.CommitAsync();
            return Unauthorized(new { mensaje = "Credenciales inválidas o cuenta no disponible. Después de 5 intentos, espera 15 minutos." });
        }
        u.intentos_fallidos = 0; u.bloqueado_hasta = null; u.ultimo_acceso = now;
        // Renueva hashes de versiones anteriores soportados por Identity.
        u.contrasena_hash = new PasswordHasher<usuario>().HashPassword(u, input.Password);
        var sid = Seguridad.Token();
        var oldSid = User.FindFirst("sid")?.Value;
        if (oldSid != null) await db.Sesiones.Where(s => s.Id == oldSid).ExecuteDeleteAsync();
        db.Sesiones.Add(new SesionUsuario { Id = sid, UsuarioId = u.id_usuario, Creada = now, UltimaActividad = now });
        await Registrar(u, "EXITOSO"); await tx.CommitAsync();
        var claims = new[] { new Claim(ClaimsGas.IdUsuario, u.id_usuario.ToString()), new Claim(ClaimsGas.Correo, u.correo), new Claim(ClaimsGas.Rol, rol!.nombre), new Claim("sid", sid) };
        await HttpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme)),
            new AuthenticationProperties { IsPersistent = false, ExpiresUtc = DateTimeOffset.UtcNow.AddHours(8) });
        return Ok(new { rol = rol.nombre, requiereCambio = u.requiere_cambio == true });
    }
    [Authorize, HttpGet("me")]
    public async Task<IActionResult> Me() {
        var u = await db.usuarios.FindAsync(User.IdUsuarioRequerido());
        return Ok(new { id = u!.id_usuario, u.correo, u.nombre, rol = User.Rol(), requiereCambio = u.requiere_cambio == true, inactividadMinutos = Seguridad.InactividadMinutos });
    }
    [Authorize, HttpPost("actividad")]
    public async Task<IActionResult> Actividad() {
        var now = DateTime.UtcNow;
        var updated = await db.Sesiones.Where(s => s.Id == User.FindFirst("sid")!.Value && s.UltimaActividad > now.AddMinutes(-Seguridad.InactividadMinutos))
            .ExecuteUpdateAsync(s => s.SetProperty(x => x.UltimaActividad, now));
        return updated == 1 ? NoContent() : Unauthorized();
    }
    [HttpPost("logout")]
    public async Task<IActionResult> Logout() {
        var sid = User.FindFirst("sid")?.Value;
        if (sid != null) await db.Sesiones.Where(s => s.Id == sid).ExecuteDeleteAsync();
        await HttpContext.SignOutAsync(); return NoContent();
    }
    [HttpPost("recuperar"), EnableRateLimiting("recovery")]
    public async Task<IActionResult> Recuperar(RecuperarInput input) {
        if (!correo.Configurado) return StatusCode(503, new { mensaje = "Recuperación no disponible. Contacta al administrador." });
        await using var tx = await db.Database.BeginTransactionAsync();
        var u = await Bloquear(input.Correo.Trim().ToLowerInvariant());
        if (u?.activo == true) {
            var recent = await db.token_recuperacions.AnyAsync(t => t.id_usuario == u.id_usuario && t.fecha_expiracion > DateTime.UtcNow.AddMinutes(28));
            if (!recent) {
                await db.token_recuperacions.Where(t => t.id_usuario == u.id_usuario).ExecuteUpdateAsync(s => s.SetProperty(t => t.usado, true));
                var token = Seguridad.Token();
                db.token_recuperacions.Add(new token_recuperacion { id_usuario = u.id_usuario, token = Seguridad.Hash(token), fecha_expiracion = DateTime.UtcNow.AddMinutes(30), usado = false });
                await db.SaveChangesAsync();
                try { await correo.Enviar(u.correo, token); }
                catch (Exception ex) when (ex is System.Net.Mail.SmtpException || ex is InvalidOperationException || ex is FormatException) {
                    logger.LogWarning("No se pudo entregar un correo de recuperación. Revisar la configuración SMTP.");
                    await tx.RollbackAsync();
                    return Ok(new { mensaje = "Si la cuenta está activa, recibirás instrucciones por correo." });
                }
            }
        }
        await tx.CommitAsync();
        return Ok(new { mensaje = "Si la cuenta está activa, recibirás instrucciones por correo." });
    }
    [HttpPost("restablecer"), EnableRateLimiting("recovery")]
    public async Task<IActionResult> Restablecer(RestablecerInput input) {
        if (!Seguridad.PasswordValida(input.Password)) return BadRequest(new { mensaje = "Usa de 12 a 128 caracteres, con letras y números." });
        var hash = Seguridad.Hash(input.Token);
        // Primero localizar, después serializar por usuario y releer el token para impedir reutilización concurrente.
        var owner = await db.token_recuperacions.AsNoTracking().Where(t => t.token == hash).Select(t => (int?)t.id_usuario).SingleOrDefaultAsync();
        if (owner == null) return BadRequest(new { mensaje = "Enlace inválido o vencido." });
        await using var tx = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.ReadCommitted);
        var u = (await db.usuarios.FromSqlInterpolated($"SELECT * FROM usuario WHERE id_usuario = {owner.Value} FOR UPDATE").ToListAsync()).SingleOrDefault();
        var token = await db.token_recuperacions.SingleOrDefaultAsync(t => t.token == hash);
        if (u?.activo != true || token == null || token.usado != false || token.fecha_expiracion <= DateTime.UtcNow)
            return BadRequest(new { mensaje = "Enlace inválido o vencido." });
        u.contrasena_hash = new PasswordHasher<usuario>().HashPassword(u, input.Password);
        u.requiere_cambio = false; u.intentos_fallidos = 0; u.bloqueado_hasta = null;
        await Seguridad.Invalidar(db, u.id_usuario);
        await db.SaveChangesAsync(); await tx.CommitAsync();
        await HttpContext.SignOutAsync(); return Ok(new { mensaje = "Contraseña actualizada. Inicia sesión." });
    }
    [Authorize, HttpPost("cambiar-password"), EnableRateLimiting("auth")]
    public async Task<IActionResult> Cambiar(CambiarInput input) {
        if (!Seguridad.PasswordValida(input.Nueva)) return BadRequest(new { mensaje = "Usa de 12 a 128 caracteres, con letras y números." });
        await using var tx = await db.Database.BeginTransactionAsync();
        var id = User.IdUsuarioRequerido();
        var u = (await db.usuarios.FromSqlInterpolated($"SELECT * FROM usuario WHERE id_usuario = {id} FOR UPDATE").ToListAsync()).Single();
        if (!Seguridad.Verificar(u, input.Actual)) return BadRequest(new { mensaje = "La contraseña actual no coincide." });
        if (input.Actual == input.Nueva) return BadRequest(new { mensaje = "Elige una contraseña diferente." });
        u.contrasena_hash = new PasswordHasher<usuario>().HashPassword(u, input.Nueva); u.requiere_cambio = false;
        await Seguridad.Invalidar(db, id); await db.SaveChangesAsync(); await tx.CommitAsync();
        await HttpContext.SignOutAsync(); return Ok(new { mensaje = "Contraseña actualizada. Inicia sesión de nuevo." });
    }
}
