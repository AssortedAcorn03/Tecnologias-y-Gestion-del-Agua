using backend.Auth;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MySql.Data.MySqlClient;
using System.ComponentModel.DataAnnotations;
namespace backend.Controllers;
public record UsuarioInput(
    [Required, EmailAddress, MaxLength(100)] string Correo,
    [Required, MaxLength(150)] string Nombre,
    [MaxLength(30), RegularExpression(@"^[A-Za-z0-9_-]+$")] string? ClaveInstitucional,
    [Range(1, int.MaxValue)] int RolId,
    bool Activo,
    [MaxLength(128)] string? Password);

[ApiController, Route("api/usuarios"), Authorize(Policy = "GestionUsuarios")]
public class UsuariosController(GasDbContext db) : ControllerBase
{
    private static object Vista(usuario u) => new {
        id = u.id_usuario, u.correo, u.nombre, claveInstitucional = u.clave_institucional,
        rolId = u.id_rol_usuario, rol = u.id_rol_usuarioNavigation?.nombre, activo = u.activo == true,
        intentosFallidos = u.intentos_fallidos, bloqueadoHasta = u.bloqueado_hasta, ultimoAcceso = u.ultimo_acceso
    };
    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] string? buscar, [FromQuery] int? rolId, [FromQuery] bool? activo, [FromQuery] int pagina = 1) {
        var q = db.usuarios.AsNoTracking().Include(u => u.id_rol_usuarioNavigation).AsQueryable();
        if (!string.IsNullOrWhiteSpace(buscar)) {
            var term = buscar.Trim();
            int.TryParse(term, out var id);
            q = q.Where(u => u.id_usuario == id || u.correo.Contains(term) || (u.nombre != null && u.nombre.Contains(term)) || (u.clave_institucional != null && u.clave_institucional.Contains(term)));
        }
        if (rolId != null) q = q.Where(u => u.id_rol_usuario == rolId);
        if (activo != null) q = q.Where(u => u.activo == activo);
        pagina = Math.Clamp(pagina, 1, 1000000);
        var total = await q.CountAsync();
        var rows = await q.OrderBy(u => u.id_usuario).Skip((pagina - 1) * 25).Take(25).ToListAsync();
        return Ok(new { total, pagina, tamano = 25, usuarios = rows.Select(Vista) });
    }
    [HttpGet("{id:int}")]
    public async Task<IActionResult> Consultar(int id) {
        var u = await db.usuarios.AsNoTracking().Include(u => u.id_rol_usuarioNavigation).SingleOrDefaultAsync(u => u.id_usuario == id);
        return u == null ? NotFound() : Ok(Vista(u));
    }
    // Todos los cambios administrativos toman el mismo candado de catálogo:
    // evita que dos administradores desactiven simultáneamente al último administrador.
    private async Task Candado() => _ = await db.CAT_rol_usuarios.FromSqlRaw("SELECT * FROM CAT_rol_usuario ORDER BY id_rol_usuario FOR UPDATE").ToListAsync();
    private async Task<string?> Validar(UsuarioInput input, int id) {
        if (string.IsNullOrWhiteSpace(input.Nombre)) return "El nombre es obligatorio.";
        if (!await db.CAT_rol_usuarios.AnyAsync(r => r.id_rol_usuario == input.RolId && r.activo == true)) return "Selecciona un rol activo.";
        var email = input.Correo.Trim().ToLowerInvariant();
        var clave = string.IsNullOrWhiteSpace(input.ClaveInstitucional) ? null : input.ClaveInstitucional.Trim().ToUpperInvariant();
        if (await db.usuarios.AnyAsync(u => u.id_usuario != id && (u.correo == email || (clave != null && u.clave_institucional == clave)))) return "Ya existe un usuario con ese correo o clave, incluso si está inactivo.";
        // Verificar también las claves ya existentes en el modelo académico.
        if (int.TryParse(clave, out var claveNumero)) {
            if (await db.alumnos.AnyAsync(a => a.clave_alumno == claveNumero && a.id_usuario != id) ||
                await db.profesor_detalles.AnyAsync(p => p.rpe == claveNumero && p.id_usuario != id))
                return "La clave ya está asociada a otro registro académico.";
        }
        return null;
    }
    [HttpPost]
    public async Task<IActionResult> Crear(UsuarioInput input) {
        if (!Seguridad.PasswordValida(input.Password)) return BadRequest(new { mensaje = "La contraseña inicial necesita de 12 a 128 caracteres, letras y números." });
        await using var tx = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.ReadCommitted);
        await Candado();
        var error = await Validar(input, 0);
        if (error != null) return Conflict(new { mensaje = error });
        var u = new usuario { fecha_creacion = DateTime.UtcNow, intentos_fallidos = 0, requiere_cambio = true };
        Aplicar(u, input);
        u.contrasena_hash = new PasswordHasher<usuario>().HashPassword(u, input.Password!);
        db.usuarios.Add(u);
        try { await db.SaveChangesAsync(); await tx.CommitAsync(); }
        catch (DbUpdateException ex) when (ex.InnerException is MySqlException { Number: 1062 }) { return Conflict(new { mensaje = "Correo o clave institucional duplicados." }); }
        return Created($"/api/usuarios/{u.id_usuario}", new { id = u.id_usuario, mensaje = "Usuario creado. Deberá cambiar su contraseña inicial." });
    }
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Editar(int id, UsuarioInput input) {
        await using var tx = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.ReadCommitted);
        await Candado();
        var u = (await db.usuarios.FromSqlInterpolated($"SELECT * FROM usuario WHERE id_usuario = {id} FOR UPDATE").ToListAsync()).SingleOrDefault();
        if (u == null) return NotFound();
        if (id == User.IdUsuarioRequerido() && (!input.Activo || input.RolId != u.id_rol_usuario)) return BadRequest(new { mensaje = "No puedes desactivar tu propia cuenta ni cambiar tu propio rol." });
        var adminRole = await db.CAT_rol_usuarios.Where(r => r.nombre == Roles.Administrador).Select(r => r.id_rol_usuario).SingleAsync();
        if (u.activo == true && u.id_rol_usuario == adminRole && (!input.Activo || input.RolId != adminRole) &&
            !await db.usuarios.AnyAsync(x => x.id_usuario != id && x.activo == true && x.id_rol_usuario == adminRole))
            return BadRequest(new { mensaje = "Debe permanecer al menos un administrador activo." });
        var error = await Validar(input, id);
        if (error != null) return Conflict(new { mensaje = error });
        Aplicar(u, input);
        await Seguridad.Invalidar(db, id);
        try { await db.SaveChangesAsync(); await tx.CommitAsync(); }
        catch (DbUpdateException ex) when (ex.InnerException is MySqlException { Number: 1062 }) { return Conflict(new { mensaje = "Correo o clave institucional duplicados." }); }
        return Ok(new { mensaje = "Usuario actualizado. Sus sesiones anteriores se cerraron." });
    }
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Baja(int id) {
        if (id == User.IdUsuarioRequerido()) return BadRequest(new { mensaje = "No puedes desactivar tu propia cuenta." });
        await using var tx = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.ReadCommitted);
        await Candado();
        var u = (await db.usuarios.FromSqlInterpolated($"SELECT * FROM usuario WHERE id_usuario = {id} FOR UPDATE").ToListAsync()).SingleOrDefault();
        if (u == null) return NotFound();
        var adminRole = await db.CAT_rol_usuarios.Where(r => r.nombre == Roles.Administrador).Select(r => r.id_rol_usuario).SingleAsync();
        if (u.activo == true && u.id_rol_usuario == adminRole && !await db.usuarios.AnyAsync(x => x.id_usuario != id && x.activo == true && x.id_rol_usuario == adminRole))
            return BadRequest(new { mensaje = "Debe permanecer al menos un administrador activo." });
        u.activo = false;
        await Seguridad.Invalidar(db, id); await db.SaveChangesAsync(); await tx.CommitAsync();
        return Ok(new { mensaje = "Usuario desactivado. Su información se conservó." });
    }

    private static void Aplicar(usuario u, UsuarioInput i) {
        u.correo = i.Correo.Trim().ToLowerInvariant(); u.nombre = i.Nombre.Trim();
        u.clave_institucional = string.IsNullOrWhiteSpace(i.ClaveInstitucional) ? null : i.ClaveInstitucional.Trim().ToUpperInvariant();
        u.id_rol_usuario = i.RolId; u.activo = i.Activo;
    }
}
