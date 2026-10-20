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

[ApiController, Route("api/egresados"), Authorize(Policy = "GestionUsuarios")]
public class EgresadosController(GasDbContext db) : ControllerBase
{
    public record AltaEgresadoInput(
        [Range(100000, 999999)] int ClaveAlumno,
        [Required, MaxLength(50)] string IdentificadorEgresado,
        [Required, MaxLength(50)] string Nombre,
        [Required, MaxLength(50)] string ApellidoPaterno,
        [MaxLength(50)] string? ApellidoMaterno,
        [Range(1, int.MaxValue)] int GeneracionId,
        [Required, EmailAddress, MaxLength(100)] string Correo,
        [MaxLength(20)] string? Telefono,
        bool Empleado,
        [MaxLength(150)] string? Empresa,
        [MaxLength(100)] string? AreaProfesional,
        [MaxLength(100)] string? Ciudad);

    [HttpPost]
    public async Task<IActionResult> Crear(AltaEgresadoInput input)
    {
        var correo = input.Correo.Trim().ToLowerInvariant();
        var identificador = input.IdentificadorEgresado.Trim();

        if (await db.alumnos.AnyAsync(a => a.clave_alumno == input.ClaveAlumno))
            return Conflict(new { mensaje = "La matrícula ya está registrada." });
        if (await db.egresados.AnyAsync(e => e.identificador_egresado == identificador))
            return Conflict(new { mensaje = "La clave de egresado ya está registrada." });
        if (await db.usuarios.AnyAsync(u => u.correo == correo))
            return Conflict(new { mensaje = "El correo ya pertenece a una cuenta." });

        var generacion = await db.generacions
            .SingleOrDefaultAsync(g => g.id_generacion == input.GeneracionId);
        if (generacion == null)
            return BadRequest(new { mensaje = "La generación seleccionada no existe." });
        var rolId = await db.CAT_rol_usuarios
            .Where(r => r.nombre == Roles.Egresado && r.activo == true)
            .Select(r => (int?)r.id_rol_usuario)
            .SingleOrDefaultAsync();
        if (rolId == null)
            return StatusCode(503, new { mensaje = "El rol Egresado no está disponible en el catálogo." });
        if (input.Empleado && string.IsNullOrWhiteSpace(input.Empresa))
            return BadRequest(new { mensaje = "Indica la empresa del egresado empleado." });

        await using var tx = await db.Database.BeginTransactionAsync();
        try
        {
            var password = Seguridad.PasswordInicial();
            var cuenta = new usuario {
                correo = correo,
                nombre = string.Join(" ", new[] { input.Nombre, input.ApellidoPaterno, input.ApellidoMaterno }
                    .Where(v => !string.IsNullOrWhiteSpace(v))),
                clave_institucional = input.ClaveAlumno.ToString(),
                id_rol_usuario = rolId.Value,
                activo = true,
                intentos_fallidos = 0,
                requiere_cambio = true,
                fecha_creacion = DateTime.UtcNow
            };
            cuenta.contrasena_hash = new PasswordHasher<usuario>().HashPassword(cuenta, password);
            db.usuarios.Add(cuenta);

            var alumno = new alumno {
                clave_alumno = input.ClaveAlumno,
                nombre = input.Nombre.Trim(),
                apellido_paterno = input.ApellidoPaterno.Trim(),
                apellido_materno = input.ApellidoMaterno?.Trim(),
                correo_institucional = correo,
                correo_personal = correo,
                telefono = input.Telefono?.Trim(),
                activo = true,
                id_generacion = input.GeneracionId,
                id_usuarioNavigation = cuenta
            };
            db.alumnos.Add(alumno);
            db.egresados.Add(new egresado {
                clave_alumnoNavigation = alumno,
                identificador_egresado = identificador,
                correo = correo,
                telefono = input.Telefono?.Trim(),
                ciudad = input.Ciudad?.Trim(),
                id_estado_egresado = await db.CAT_estado_egresados
                    .Where(e => e.nombre == "Localizable")
                    .Select(e => (int?)e.id_estado_egresado)
                    .SingleOrDefaultAsync(),
                ultima_actualizacion = DateTime.UtcNow.Date,
                localizable = true
            });
            await db.SaveChangesAsync();

            if (input.Empleado)
            {
                var empresaNombre = input.Empresa!.Trim();
                var empresa = await db.empresas
                    .SingleOrDefaultAsync(e => e.nombre == empresaNombre && e.ciudad == input.Ciudad);
                if (empresa == null)
                {
                    empresa = new empresa { nombre = empresaNombre, ciudad = input.Ciudad?.Trim() };
                    db.empresas.Add(empresa);
                    await db.SaveChangesAsync();
                }
                var egresado = await db.egresados
                    .SingleAsync(e => e.clave_alumno == input.ClaveAlumno);
                db.empleos.Add(new empleo {
                    clave_alumnoNavigation = egresado,
                    id_empresa = empresa.id_empresa,
                    tipo = "Empleado",
                    area_profesional = input.AreaProfesional?.Trim(),
                    id_situacion_laboral = await db.CAT_situacion_laborals
                        .Where(s => s.nombre == "Con trabajo")
                        .Select(s => (int?)s.id_situacion_laboral)
                        .SingleOrDefaultAsync(),
                    trabajo_actual = true
                });
                await db.SaveChangesAsync();
            }

            await tx.CommitAsync();
            return Created($"/api/egresados/{input.ClaveAlumno}", new {
                claveAlumno = input.ClaveAlumno,
                usuarioId = cuenta.id_usuario,
                passwordInicial = password,
                mensaje = "Egresado registrado. Deberá cambiar su contraseña inicial."
            });
        }
        catch (DbUpdateException ex) when (ex.InnerException is MySqlException { Number: 1062 })
        {
            await tx.RollbackAsync();
            return Conflict(new { mensaje = "La matrícula, correo o identificador ya están registrados." });
        }
    }

    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] string? buscar, CancellationToken ct)
    {
        var usuarios = await db.usuarios
            .AsNoTracking()
            .Where(u => u.id_rol_usuarioNavigation != null &&
                        u.id_rol_usuarioNavigation.nombre == Roles.Egresado)
            .Include(u => u.id_rol_usuarioNavigation)
            .Include(u => u.alumnos)
                .ThenInclude(a => a.id_generacionNavigation)
            .Include(u => u.alumnos)
                .ThenInclude(a => a.egresado)
                    .ThenInclude(e => e!.id_estado_egresadoNavigation)
            .Include(u => u.alumnos)
                .ThenInclude(a => a.egresado)
                    .ThenInclude(e => e!.empleos)
                        .ThenInclude(e => e.id_empresaNavigation)
            .Include(u => u.alumnos)
                .ThenInclude(a => a.egresado)
                    .ThenInclude(e => e!.empleos)
                        .ThenInclude(e => e.id_situacion_laboralNavigation)
            .ToListAsync(ct);

        var term = buscar?.Trim();
        var egresados = usuarios
            .SelectMany(u => u.alumnos.DefaultIfEmpty(), (u, alumno) => new { u, alumno })
            .Where(x => string.IsNullOrWhiteSpace(term) ||
                        (x.alumno != null &&
                         $"{x.alumno.nombre} {x.alumno.apellido_paterno} {x.alumno.apellido_materno}"
                             .Contains(term!, StringComparison.OrdinalIgnoreCase)) ||
                        (x.alumno != null && x.alumno.clave_alumno.ToString().Contains(term!, StringComparison.OrdinalIgnoreCase)) ||
                        (x.u.nombre ?? "").Contains(term!, StringComparison.OrdinalIgnoreCase) ||
                        x.u.correo.Contains(term!, StringComparison.OrdinalIgnoreCase))
            .Select(x =>
            {
                var alumno = x.alumno;
                var egresado = alumno?.egresado;
                var empleos = egresado?.empleos
                    .OrderByDescending(e => e.trabajo_actual == true)
                    .ThenByDescending(e => e.id_empleo)
                    .ToList() ?? [];
                var empleoActual = empleos.FirstOrDefault();
                var nombre = alumno == null
                    ? x.u.nombre
                    : string.Join(" ", new[] { alumno.nombre, alumno.apellido_paterno, alumno.apellido_materno }
                        .Where(v => !string.IsNullOrWhiteSpace(v)));

                return new
                {
                    usuarioId = x.u.id_usuario,
                    nombre = string.IsNullOrWhiteSpace(nombre) ? x.u.correo : nombre,
                    correo = egresado?.correo ?? x.u.correo,
                    matricula = alumno?.clave_alumno,
                    generacion = alumno?.id_generacionNavigation?.nombre_generacion,
                    identificador = egresado?.identificador_egresado,
                    estado = egresado?.id_estado_egresadoNavigation?.nombre,
                    localizable = egresado?.localizable == true,
                    situacionLaboral = empleoActual?.id_situacion_laboralNavigation?.nombre,
                    ultimaActualizacion = egresado?.ultima_actualizacion,
                    empleos = empleos.Select(e => new
                    {
                        periodo = e.trabajo_actual == true ? "Actual" : "Anterior",
                        empresa = e.id_empresaNavigation?.nombre,
                        puesto = e.tipo,
                        area = e.area_profesional,
                        tipo = e.id_situacion_laboralNavigation?.nombre
                    })
                };
            })
            .OrderBy(e => e.nombre)
            .ToList();

        return Ok(new { total = egresados.Count, egresados });
    }

    [HttpPut("{claveAlumno:int}/no-localizable")]
    public async Task<IActionResult> MarcarNoLocalizable(int claveAlumno, CancellationToken ct)
    {
        var egresado = await db.egresados
            .SingleOrDefaultAsync(e => e.clave_alumno == claveAlumno, ct);
        if (egresado == null)
            return NotFound(new { mensaje = "No existe un egresado con esa matrícula." });

        var estado = await db.CAT_estado_egresados
            .SingleOrDefaultAsync(e => e.nombre == "No localizable", ct);
        if (estado == null)
            return StatusCode(503, new { mensaje = "El estado No localizable no está disponible en el catálogo." });

        egresado.localizable = false;
        egresado.id_estado_egresado = estado.id_estado_egresado;
        egresado.ultima_actualizacion = DateTime.UtcNow.Date;
        await db.SaveChangesAsync(ct);

        return Ok(new {
            claveAlumno,
            estado = estado.nombre,
            mensaje = "El egresado fue marcado como no localizable."
        });
    }
}
