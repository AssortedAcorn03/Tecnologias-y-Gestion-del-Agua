using backend.Data;
using backend.Auth;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MySql.Data.MySqlClient;
using System.ComponentModel.DataAnnotations;

namespace backend.Controllers;

[ApiController, Route("api/comites"), Authorize]
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

    [HttpPost, Authorize(Policy = "GestionUsuarios")]
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
            var usuarioId = User.IdUsuarioRequerido();
            db.historial_comites.AddRange(
                db.comite_profesors.Local
                    .Where(cp => cp.id_comite == comite.id_comite && cp.activo == true)
                    .Select(cp => Historial(comite.id_comite, usuarioId, "AGREGAR_INTEGRANTE",
                        null, cp.rpe, null, cp.id_rol_comite, "Integrante registrado con el comité.")));
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

    [HttpGet, Authorize(Policy = "GestionUsuarios")]
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

        [HttpGet("mios")]
        public async Task<IActionResult> MisComites([FromQuery] string? buscar, CancellationToken ct)
        {
            var rpe = await MiRpe(ct);
            if (rpe == null) return Forbid();

            var comites = await db.comites
                .AsNoTracking()
                .Include(c => c.id_tesisNavigation)
                    .ThenInclude(t => t.clave_alumnoNavigation)
                .Include(c => c.comite_profesors)
                    .ThenInclude(cp => cp.rpeNavigation)
                .Include(c => c.comite_profesors)
                    .ThenInclude(cp => cp.id_rol_comiteNavigation)
                .Where(c => c.comite_profesors.Any(cp => cp.rpe == rpe && cp.activo != false))
                .OrderByDescending(c => c.id_comite)
                .ToListAsync(ct);

            return Ok(new {
                total = comites.Count,
                comites = FiltrarComites(comites, buscar, rpe)
            });
        }

        [HttpPut("{id:int}/integrantes")]
        public async Task<IActionResult> ActualizarIntegrantes(
            int id, IntegranteComiteInput input, CancellationToken ct)
        {
            var rpe = await MiRpe(ct);
            var esDirector = rpe.HasValue && await db.comite_profesors
                .AnyAsync(cp => cp.id_comite == id && cp.rpe == rpe &&
                    cp.activo == true && cp.id_rol_comiteNavigation.nombre == "Director", ct);
            if (!User.IsInRole(Roles.Coordinador) && !esDirector)
                return Forbid();
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
                .OrderBy(cp => cp.id_rol_comite)
                .ThenBy(cp => cp.id_comite_profesor)
                .ToListAsync(ct);
            foreach (var actual in actuales) actual.activo = false;
            var fecha = DateTime.UtcNow.Date;
            var nuevos = new List<comite_profesor> { new() {
                id_comite = id, rpe = input.DirectorRpe,
                id_rol_comite = roles["Director"], fecha_asignacion = fecha, activo = true
            } };
            if (input.CodirectorRpe.HasValue)
                nuevos.Add(new comite_profesor {
                    id_comite = id, rpe = input.CodirectorRpe.Value,
                    id_rol_comite = roles["Codirector"], fecha_asignacion = fecha, activo = true
                });
            nuevos.AddRange(input.SinodalesRpe.Select(rpe => new comite_profesor {
                id_comite = id, rpe = rpe, id_rol_comite = roles["Asesor"],
                fecha_asignacion = fecha, activo = true
            }));
            db.comite_profesors.AddRange(nuevos);
            await db.SaveChangesAsync(ct);
            var usuarioId = User.IdUsuarioRequerido();
            var cambios = new List<historial_comite>();
            var rolesCombinados = actuales.Select(cp => cp.id_rol_comite)
                .Concat(nuevos.Select(cp => cp.id_rol_comite))
                .Distinct();
            foreach (var idRol in rolesCombinados)
            {
                var anterioresPorRol = actuales.Where(cp => cp.id_rol_comite == idRol).ToList();
                var nuevosPorRol = nuevos.Where(cp => cp.id_rol_comite == idRol).ToList();
                var cantidad = Math.Max(anterioresPorRol.Count, nuevosPorRol.Count);
                for (var i = 0; i < cantidad; i++)
                {
                    var anterior = i < anterioresPorRol.Count ? anterioresPorRol[i] : null;
                    var nuevo = i < nuevosPorRol.Count ? nuevosPorRol[i] : null;
                    if (anterior != null && nuevo != null && anterior.rpe == nuevo.rpe)
                        continue;

                    var accion = anterior == null
                        ? "AGREGAR_INTEGRANTE"
                        : nuevo == null
                            ? "REMOVER_INTEGRANTE"
                            : "CAMBIAR_INTEGRANTE";
                    cambios.Add(Historial(id, usuarioId, accion,
                        anterior?.rpe, nuevo?.rpe,
                        anterior?.id_rol_comite, nuevo?.id_rol_comite,
                        "Integrantes del comité actualizados."));
                }
            }
            db.historial_comites.AddRange(cambios);
            await db.SaveChangesAsync(ct);
            await tx.CommitAsync(ct);
            return Ok(new { mensaje = "Integrantes actualizados correctamente." });
        }

        [HttpGet("{id:int}/historial")]
        public async Task<IActionResult> Historial(int id, CancellationToken ct)
        {
            var rpe = await MiRpe(ct);
            var autorizado = User.IsInRole(Roles.Coordinador) ||
                rpe.HasValue && await db.comite_profesors.AnyAsync(cp =>
                    cp.id_comite == id && cp.rpe == rpe && cp.activo == true, ct);
            if (!autorizado)
                return Forbid();
            if (!await db.comites.AnyAsync(c => c.id_comite == id, ct))
                return NotFound(new { mensaje = "El comité no existe." });

            var historial = await db.historial_comites
                .AsNoTracking()
                .Where(h => h.id_comite == id)
                .Include(h => h.id_usuarioNavigation)
                .OrderByDescending(h => h.fecha_cambio)
                .ThenByDescending(h => h.id_historial)
                .ToListAsync(ct);
            var rpes = historial.SelectMany(h => new[] { h.rpe_anterior, h.rpe_nuevo })
                .Where(rpe => rpe.HasValue)
                .Select(rpe => rpe!.Value)
                .Distinct()
                .ToArray();
            var profesores = await db.profesors
                .AsNoTracking()
                .Where(p => rpes.Contains(p.rpe))
                .ToDictionaryAsync(p => p.rpe, ct);
            var roles = await db.CAT_rol_comites
                .AsNoTracking()
                .ToDictionaryAsync(r => r.id_rol_comite, r => r.nombre, ct);

            return Ok(historial.Select(h => new {
                fecha = h.fecha_cambio,
                accion = h.accion,
                integranteAnterior = h.rpe_anterior.HasValue &&
                    profesores.TryGetValue(h.rpe_anterior.Value, out var anterior)
                        ? $"{Nombre(anterior)} (RPE {h.rpe_anterior})" : null,
                integranteNuevo = h.rpe_nuevo.HasValue &&
                    profesores.TryGetValue(h.rpe_nuevo.Value, out var nuevo)
                        ? $"{Nombre(nuevo)} (RPE {h.rpe_nuevo})" : null,
                rolAnterior = h.id_rol_anterior.HasValue &&
                    roles.TryGetValue(h.id_rol_anterior.Value, out var rolAnterior)
                        ? rolAnterior : null,
                rolNuevo = h.id_rol_nuevo.HasValue &&
                    roles.TryGetValue(h.id_rol_nuevo.Value, out var rolNuevo)
                        ? rolNuevo : null,
                realizadoPor = h.id_usuarioNavigation?.correo ?? "Usuario no disponible"
            }));
        }

        private async Task<int?> MiRpe(CancellationToken ct) =>
            await db.profesor_detalles
                .Where(d => d.id_usuario == User.IdUsuarioRequerido() && d.activo == true)
                .Select(d => (int?)d.rpe)
                .SingleOrDefaultAsync(ct);

        private static IEnumerable<object> FiltrarComites(
            IEnumerable<comite> comites, string? buscar, int? rpe = null)
        {
            var termino = buscar?.Trim();
            return comites
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
                    puedeModificar = rpe.HasValue && c.comite_profesors.Any(cp =>
                        cp.rpe == rpe && cp.activo == true &&
                        cp.id_rol_comiteNavigation.nombre == "Director"),
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
        }

        private static historial_comite Historial(
            int idComite, int idUsuario, string accion,
            int? rpeAnterior, int? rpeNuevo,
            int? rolAnterior, int? rolNuevo, string observaciones) =>
            new() {
                id_comite = idComite,
                id_usuario = idUsuario,
                accion = accion,
                rpe_anterior = rpeAnterior,
                rpe_nuevo = rpeNuevo,
                id_rol_anterior = rolAnterior,
                id_rol_nuevo = rolNuevo,
                fecha_cambio = DateTime.UtcNow,
                observaciones = observaciones
            };

        private static string Nombre(alumno alumno) =>
            string.Join(" ", new[] { alumno.nombre, alumno.apellido_paterno, alumno.apellido_materno }
                .Where(v => !string.IsNullOrWhiteSpace(v)));

        private static string Nombre(profesor profesor) =>
            string.Join(" ", new[] { profesor.nombre, profesor.apellido_paterno, profesor.apellido_materno }
                .Where(v => !string.IsNullOrWhiteSpace(v)));
        }
