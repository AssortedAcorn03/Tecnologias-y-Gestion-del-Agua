using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MySql.Data.MySqlClient;
using System.ComponentModel.DataAnnotations;

namespace backend.Controllers;

[ApiController, Route("api/comites"), Authorize(Policy = "GestionUsuarios")]
public class ComitesController(GasDbContext db) : ControllerBase
{
    public record AltaComiteInput(
        [Required, MaxLength(50)] string Identificador,
        [Required] string ClaveTesista,
        [Range(1, 3)] int NumeroSinodales,
        [Range(1, int.MaxValue)] int DirectorRpe,
        int? CodirectorRpe,
        [Required, MinLength(1), MaxLength(3)] int[] SinodalesRpe,
        [Required] DateTime Fecha);

    public record IntegranteComiteInput(
        [Range(1, int.MaxValue)] int DirectorRpe,
        int? CodirectorRpe,
        [Required, MinLength(1), MaxLength(3)] int[] SinodalesRpe);

    [HttpGet("profesores")]
    public async Task<IActionResult> Profesores(CancellationToken ct)
    {
        var profesores = await db.profesors
            .AsNoTracking()
            .OrderBy(p => p.apellido_paterno)
            .ThenBy(p => p.nombre)
            .ToListAsync(ct);
        return Ok(profesores.Select(p => new {
            rpe = p.rpe,
            nombre = string.Join(" ", new[] { p.nombre, p.apellido_paterno, p.apellido_materno }
                .Where(v => !string.IsNullOrWhiteSpace(v)))
        }));
    }

    [HttpPost]
    public async Task<IActionResult> Crear(AltaComiteInput input, CancellationToken ct)
    {
        var identificador = input.Identificador.Trim();
        if (input.SinodalesRpe.Distinct().Count() != input.SinodalesRpe.Length)
            return BadRequest(new { mensaje = "No puedes repetir un profesor en los sinodales." });
        if (input.SinodalesRpe.Contains(input.DirectorRpe) ||
            input.CodirectorRpe != null && input.SinodalesRpe.Contains(input.CodirectorRpe.Value) ||
            input.CodirectorRpe == input.DirectorRpe)
            return BadRequest(new { mensaje = "Cada integrante debe ser un profesor distinto." });

        if (!int.TryParse(input.ClaveTesista.Trim(), out var claveAlumno))
            return BadRequest(new { mensaje = "La clave del tesista debe ser la matrícula numérica del alumno." });

        var tesis = await db.teses
            .SingleOrDefaultAsync(t => t.clave_alumno == claveAlumno, ct);
        if (tesis == null)
            return NotFound(new { mensaje = "No existe una tesis registrada para esa matrícula." });

        if (await db.comites.AnyAsync(c => c.id_tesis == tesis.id_tesis, ct))
            return Conflict(new { mensaje = "La tesis ya tiene un comité tutorial registrado." });

        var rpes = input.SinodalesRpe
            .Append(input.DirectorRpe)
            .Concat(input.CodirectorRpe.HasValue ? [input.CodirectorRpe.Value] : [])
            .Distinct()
            .ToArray();
        var profesores = await db.profesors
            .Where(p => rpes.Contains(p.rpe))
            .Select(p => p.rpe)
            .ToListAsync(ct);
        if (profesores.Count != rpes.Length)
            return BadRequest(new { mensaje = "Uno o más profesores seleccionados no existen." });

        await using var tx = await db.Database.BeginTransactionAsync(ct);
        try
        {
            var comite = new comite {
                id_tesis = tesis.id_tesis,
                tipo = identificador
            };
            db.comites.Add(comite);
            await db.SaveChangesAsync(ct);

            var roles = await db.CAT_rol_comites
                .Where(r => r.nombre == "Director" || r.nombre == "Codirector" || r.nombre == "Asesor")
                .ToDictionaryAsync(r => r.nombre, r => r.id_rol_comite, ct);
            if (!roles.ContainsKey("Director") || !roles.ContainsKey("Asesor") ||
                input.CodirectorRpe.HasValue && !roles.ContainsKey("Codirector"))
                return StatusCode(503, new { mensaje = "Faltan roles de comité en el catálogo." });

            var fecha = input.Fecha.Date;
            db.comite_profesors.Add(new comite_profesor {
                id_comite = comite.id_comite,
                rpe = input.DirectorRpe,
                id_rol_comite = roles["Director"],
                fecha_asignacion = fecha,
                activo = true
            });
            if (input.CodirectorRpe.HasValue)
                db.comite_profesors.Add(new comite_profesor {
                    id_comite = comite.id_comite,
                    rpe = input.CodirectorRpe.Value,
                    id_rol_comite = roles["Codirector"],
                    fecha_asignacion = fecha,
                    activo = true
                });
            db.comite_profesors.AddRange(input.SinodalesRpe.Select(rpe => new comite_profesor {
                id_comite = comite.id_comite,
                rpe = rpe,
                id_rol_comite = roles["Asesor"],
                fecha_asignacion = fecha,
                activo = true
            }));
            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
            return Created($"/api/comites/{comite.id_comite}", new {
                id = comite.id_comite,
                tesisId = tesis.id_tesis,
                mensaje = "Comité tutorial registrado correctamente."
            });
        }
        catch (DbUpdateException ex) when (ex.InnerException is MySqlException { Number: 1062 })
        {
            await tx.RollbackAsync(ct);
            return Conflict(new { mensaje = "El comité o alguno de sus integrantes ya está registrado." });
        }
    }

    [HttpGet]
    public async Task<IActionResult> Listar([FromQuery] string? buscar, CancellationToken ct)
        {
            var comites = await db.comites
                .AsNoTracking()
                .Include(c => c.id_tesisNavigation)
                    .ThenInclude(t => t.clave_alumnoNavigation)
                .Include(c => c.comite_profesors)
                    .ThenInclude(cp => cp.rpeNavigation)
                .Include(c => c.comite_profesors)
                    .ThenInclude(cp => cp.id_rol_comiteNavigation)
                .OrderByDescending(c => c.id_comite)
                .ToListAsync(ct);

            var termino = buscar?.Trim();
            var resultado = comites
                .Where(c => string.IsNullOrWhiteSpace(termino) ||
                    (c.tipo ?? "").Contains(termino!, StringComparison.OrdinalIgnoreCase) ||
                    c.id_tesisNavigation.clave_alumno.ToString().Contains(termino!, StringComparison.OrdinalIgnoreCase) ||
                    (c.id_tesisNavigation.titulo ?? "").Contains(termino!, StringComparison.OrdinalIgnoreCase))
                .Select(c => new {
                    id = c.id_comite,
                    identificador = c.tipo,
                    tesisId = c.id_tesis,
                    matricula = c.id_tesisNavigation.clave_alumno,
                    tesista = Nombre(c.id_tesisNavigation.clave_alumnoNavigation),
                    estado = c.comite_profesors.Any(cp => cp.activo == true) ? "Activo" : "Inactivo",
                    integrantes = c.comite_profesors
                        .Where(cp => cp.activo == true)
                        .OrderBy(cp => cp.id_rol_comite)
                        .Select(cp => new {
                            id = cp.id_comite_profesor,
                            rpe = cp.rpe,
                            nombre = Nombre(cp.rpeNavigation),
                            rol = cp.id_rol_comiteNavigation.nombre,
                            fecha = cp.fecha_asignacion
                        })
                });
            return Ok(new { total = resultado.Count(), comites = resultado });
        }

        [HttpPut("{id:int}/integrantes")]
        public async Task<IActionResult> ActualizarIntegrantes(
            int id, IntegranteComiteInput input, CancellationToken ct)
        {
            if (input.SinodalesRpe.Distinct().Count() != input.SinodalesRpe.Length)
                return BadRequest(new { mensaje = "No puedes repetir un profesor en los sinodales." });
            var rpes = input.SinodalesRpe.Append(input.DirectorRpe)
                .Concat(input.CodirectorRpe.HasValue ? [input.CodirectorRpe.Value] : [])
                .ToArray();
            if (rpes.Distinct().Count() != rpes.Length)
                return BadRequest(new { mensaje = "Cada integrante debe ser un profesor distinto." });
            var comite = await db.comites.SingleOrDefaultAsync(c => c.id_comite == id, ct);
            if (comite == null) return NotFound(new { mensaje = "El comité no existe." });
            var existentes = await db.profesors.Where(p => rpes.Contains(p.rpe)).Select(p => p.rpe).ToListAsync(ct);
            if (existentes.Count != rpes.Distinct().Count())
                return BadRequest(new { mensaje = "Uno o más profesores seleccionados no existen." });
            var roles = await db.CAT_rol_comites
                .Where(r => r.nombre == "Director" || r.nombre == "Codirector" || r.nombre == "Asesor")
                .ToDictionaryAsync(r => r.nombre, r => r.id_rol_comite, ct);
            if (!roles.ContainsKey("Director") || !roles.ContainsKey("Asesor") ||
                input.CodirectorRpe.HasValue && !roles.ContainsKey("Codirector"))
                return StatusCode(503, new { mensaje = "Faltan roles de comité en el catálogo." });

            await using var tx = await db.Database.BeginTransactionAsync(ct);
            var actuales = await db.comite_profesors
                .Where(cp => cp.id_comite == id && cp.activo == true)
                .ToListAsync(ct);
            foreach (var actual in actuales) actual.activo = false;
            var fecha = DateTime.UtcNow.Date;
            db.comite_profesors.Add(new comite_profesor {
                id_comite = id, rpe = input.DirectorRpe,
                id_rol_comite = roles["Director"], fecha_asignacion = fecha, activo = true
            });
            if (input.CodirectorRpe.HasValue)
                db.comite_profesors.Add(new comite_profesor {
                    id_comite = id, rpe = input.CodirectorRpe.Value,
                    id_rol_comite = roles["Codirector"], fecha_asignacion = fecha, activo = true
                });
            db.comite_profesors.AddRange(input.SinodalesRpe.Select(rpe => new comite_profesor {
                id_comite = id, rpe = rpe, id_rol_comite = roles["Asesor"],
                fecha_asignacion = fecha, activo = true
            }));
            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
            return Ok(new { mensaje = "Integrantes actualizados correctamente." });
        }

        private static string Nombre(alumno alumno) =>
            string.Join(" ", new[] { alumno.nombre, alumno.apellido_paterno, alumno.apellido_materno }
                .Where(v => !string.IsNullOrWhiteSpace(v)));

        private static string Nombre(profesor profesor) =>
            string.Join(" ", new[] { profesor.nombre, profesor.apellido_paterno, profesor.apellido_materno }
                .Where(v => !string.IsNullOrWhiteSpace(v)));
        }
