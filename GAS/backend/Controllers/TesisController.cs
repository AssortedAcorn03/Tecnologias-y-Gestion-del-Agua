using backend.Auth;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MySql.Data.MySqlClient;
using System.ComponentModel.DataAnnotations;

namespace backend.Controllers;

/// <summary>
/// Solicitud de tesis (RF-01.10.1). Son los cuatro datos que el diagrama del AMyD
/// pide capturar, más el director que el tesista propone.
/// </summary>
public record SolicitudTesisInput(
    [Required, MaxLength(255)] string Titulo,
    [MaxLength(1000)] string? Resumen,
    [Required, MaxLength(255)] string LineaInvestigacion,
    [Range(1, int.MaxValue)] int ModalidadId,
    [Range(1, int.MaxValue)] int DirectorRpe);

/// <summary>
/// Integrantes que el director elige para el comité (RF-01.10.6). El director no
/// viaja en el cuerpo: se toma de `tesis.rpe_director`, que es quien aceptó dirigirla.
/// Los sinodales se guardan con rol «Asesor», que es el mapeo que ya usa
/// ComitesController; el catálogo no tiene un rol «Sinodal».
/// </summary>
public record AsignacionComiteInput(
    int? CodirectorRpe,
    [Required, MinLength(1), MaxLength(3)] int[] SinodalesRpe);

/// <summary>Modalidad de titulación que elige el propio alumno.</summary>
public record MiModalidadInput([Range(1, int.MaxValue)] int ModalidadId);

/// <summary>Resolución del director sobre una solicitud.</summary>
public record ResolucionTesisInput(
    bool Aceptar,
    [MaxLength(255)] string? MotivoRechazo);

/// <summary>Corrección de título y resumen, sin tocar el circuito de aprobación.</summary>
public record AltaTesisInput(
    [Required, MaxLength(255)] string Titulo,
    [MaxLength(1000)] string? Resumen);

/// <summary>Actualización de tesis (RF-01.10.3).</summary>
public record EdicionTesisInput(
    [Required, MaxLength(255)] string Titulo,
    [MaxLength(1000)] string? Resumen,
    [Range(1, int.MaxValue)] int EstadoTesisId,
    [Range(0, 100)] decimal PorcentajeActual);

/// <summary>
/// Registro de una revisión del comité (RF-01.10.4), con sus compromisos.
/// El porcentaje de la revisión actualiza el de la tesis: es la fuente de verdad
/// del avance, y así la gráfica del historial y el indicador no se contradicen.
/// </summary>
public record RevisionInput(
    [Required] DateTime Fecha,
    [Range(0, 100)] decimal PorcentajeAvance,
    [MaxLength(1000)] string? Criterios,
    [MaxLength(2000)] string? Comentarios,
    [MaxLength(50)] string? Estado,
    [Range(1, int.MaxValue)] int? PeriodoId,
    [MaxLength(2000)] string? Compromisos,
    DateTime? FechaCompromiso);

/// <summary>
/// Gestión de tesis (RF-01.10): alta, consulta, actualización y seguimiento del
/// avance.
///
/// Dos audiencias, como en egresados:
///   · el tesista sobre /mi-tesis, resolviendo su clave de la sesión;
///   · el coordinador sobre /{id}, con la política GestionUsuarios.
///
/// Lo que el tesista puede tocar es deliberadamente menos: título y resumen. El
/// estado y el porcentaje los fija el comité a través de las revisiones, tal como
/// advierte el propio mockup de alta («el porcentaje de avance y el estado serán
/// actualizados por el comité tutorial»).
///
/// Los estados salen de CAT_estado_tesis tal como lo carga seed.sql. No se validan
/// transiciones: el diagrama de estados del AMyD usa otro vocabulario
/// (Registro, Asignacion, EnProgreso…) y mientras esa discrepancia no se resuelva,
/// fijar transiciones en el código sería adivinar.
/// </summary>
[ApiController, Route("api/tesis"), Authorize]
public class TesisController(GasDbContext db) : ControllerBase
{
    // -----------------------------------------------------------------
    // Identidad y proyecciones
    // -----------------------------------------------------------------

    private async Task<int?> MiClave() =>
        await db.alumnos.Where(a => a.id_usuario == User.IdUsuarioRequerido())
            .Select(a => (int?)a.clave_alumno).SingleOrDefaultAsync();

    private static object Vista(tesi t) => new {
        id = t.id_tesis,
        t.titulo,
        t.resumen,
        claveAlumno = t.clave_alumno,
        alumno = string.Join(' ', new[] { t.clave_alumnoNavigation?.nombre,
            t.clave_alumnoNavigation?.apellido_paterno, t.clave_alumnoNavigation?.apellido_materno }
            .Where(s => !string.IsNullOrWhiteSpace(s))),
        correoAlumno = t.clave_alumnoNavigation?.correo_institucional,
        programa = t.id_programaNavigation?.nombre,
        generacion = t.clave_alumnoNavigation?.id_generacionNavigation?.nombre_generacion,
        estadoTesisId = t.id_estado_tesis,
        estadoTesis = t.id_estado_tesisNavigation?.nombre,
        porcentajeActual = t.porcentaje_actual ?? 0m,
        fechaRegistro = t.fecha_registro,
        ultimaActualizacion = t.ultima_actualizacion,
        lineaInvestigacion = t.linea_investigacion,
        modalidadId = t.id_modalidad,
        estadoSolicitud = t.estado_solicitud,
        directorRpe = t.rpe_director,
        fechaSolicitud = t.fecha_solicitud,
        fechaResolucion = t.fecha_resolucion,
        motivoRechazo = t.motivo_rechazo,
        // El semestre que cursa es lo que permite detectar rezago (RF-01.9), así que
        // viaja junto al porcentaje aunque el mockup no lo pinte.
        semestre = t.clave_alumnoNavigation == null ? null
            : t.clave_alumnoNavigation.alumno_detalles.OrderByDescending(d => d.id_periodo)
                .Select(d => d.semestre).FirstOrDefault()
    };

    private static object VistaRevision(revision r) => new {
        id = r.id_revision,
        r.fecha,
        porcentajeAvance = r.porcentaje_avance ?? 0m,
        r.criterios,
        r.comentarios,
        r.estado,
        periodo = r.id_periodoNavigation?.nombre,
        compromisos = r.acuerdo_evaluacions.Select(a => new {
            id = a.id_acuerdo, a.descripcion,
            fechaCompromiso = a.fecha_compromiso, cumplido = a.cumplido == true
        })
    };

    private IQueryable<tesi> Consulta() => db.teses
        .Include(t => t.clave_alumnoNavigation).ThenInclude(a => a!.id_generacionNavigation)
        .Include(t => t.clave_alumnoNavigation).ThenInclude(a => a!.alumno_detalles)
        .Include(t => t.id_programaNavigation)
        .Include(t => t.id_estado_tesisNavigation);

    private bool EsGestor() => User.IsInRole(Roles.Administrador) || User.IsInRole(Roles.Coordinador);

    // -----------------------------------------------------------------
    // Modalidad de titulación elegida por el alumno
    //
    // El panel del alumno tiene un paso de «Registro de modalidad de titulación»
    // que hasta ahora solo cambiaba una clase de CSS: la elección se perdía al
    // recargar. Esto la persiste.
    //
    // De la que se habla aquí es de `alumno.id_modalidad`, la intención del
    // alumno. `tesis.id_modalidad` es otra cosa: la que quedó fijada en la
    // solicitud que el director aprobó, y esa no se toca desde aquí.
    // -----------------------------------------------------------------

    /// <summary>Modalidad del alumno en sesión, para saber qué mostrarle.</summary>
    [HttpGet("mi-modalidad")]
    public async Task<IActionResult> MiModalidad()
    {
        var clave = await MiClave();
        if (clave == null) return NotFound(new { mensaje = "Tu cuenta no está asociada a un alumno." });
        var dato = await db.alumnos.Where(a => a.clave_alumno == clave)
            .Select(a => new { a.id_modalidad, modalidad = a.id_modalidadNavigation!.nombre })
            .SingleAsync();
        return Ok(new { claveAlumno = clave, modalidadId = dato.id_modalidad, modalidad = dato.modalidad });
    }

    [HttpPut("mi-modalidad")]
    public async Task<IActionResult> ActualizarMiModalidad(MiModalidadInput input)
    {
        var clave = await MiClave();
        if (clave == null) return NotFound(new { mensaje = "Tu cuenta no está asociada a un alumno." });
        if (!await db.CAT_modalidad_titulacions.AnyAsync(m => m.id_modalidad == input.ModalidadId && m.activo == true))
            return Conflict(new { mensaje = "Selecciona una modalidad de titulación activa." });

        await using var tx = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.ReadCommitted);
        var a = await db.alumnos.SingleAsync(x => x.clave_alumno == clave);
        // Si ya hay una tesis aprobada, la modalidad quedó fijada por esa solicitud:
        // cambiarla aquí dejaría al alumno con una tesis en una modalidad distinta
        // de la que declara.
        if (await db.teses.AnyAsync(t => t.clave_alumno == clave))
            return Conflict(new { mensaje = "Ya tienes una tesis registrada: la modalidad no puede cambiarse desde aquí." });
        a.id_modalidad = input.ModalidadId;
        await db.SaveChangesAsync();
        await tx.CommitAsync();
        return Ok(new { mensaje = "Modalidad de titulación registrada." });
    }

    // -----------------------------------------------------------------
    // RF-01.10.2 · Consulta
    // -----------------------------------------------------------------

    [HttpGet, Authorize(Policy = "GestionUsuarios")]
    public async Task<IActionResult> Listar([FromQuery] string? buscar, [FromQuery] int? estadoTesisId,
        [FromQuery] int? generacionId, [FromQuery] int pagina = 1)
    {
        var q = Consulta().AsNoTracking().AsQueryable();
        if (!string.IsNullOrWhiteSpace(buscar))
        {
            var term = buscar.Trim();
            int.TryParse(term, out var clave);
            q = q.Where(t => t.clave_alumno == clave
                || (t.titulo != null && t.titulo.Contains(term))
                || (t.clave_alumnoNavigation!.nombre != null && t.clave_alumnoNavigation.nombre.Contains(term))
                || (t.clave_alumnoNavigation.apellido_paterno != null && t.clave_alumnoNavigation.apellido_paterno.Contains(term)));
        }
        if (estadoTesisId != null) q = q.Where(t => t.id_estado_tesis == estadoTesisId);
        if (generacionId != null) q = q.Where(t => t.clave_alumnoNavigation!.id_generacion == generacionId);
        pagina = Math.Clamp(pagina, 1, 1000000);
        var total = await q.CountAsync();
        var filas = await q.OrderByDescending(t => t.id_tesis).Skip((pagina - 1) * 25).Take(25).ToListAsync();
        return Ok(new { total, pagina, tamano = 25, tesis = filas.Select(Vista) });
    }

    /// <summary>Ficha completa: la tesis, su comité y todas sus revisiones.</summary>
    [HttpGet("{id:int}")]
    public async Task<IActionResult> Consultar(int id)
    {
        var t = await Consulta().AsNoTracking().SingleOrDefaultAsync(x => x.id_tesis == id);
        if (t == null) return NotFound(new { mensaje = "Esa tesis no existe." });
        if (!EsGestor() && t.clave_alumno != await MiClave())
            return Forbid();
        return Ok(await Ficha(t));
    }

    /// <summary>La tesis del tesista en sesión, para su portal.</summary>
    [HttpGet("mi-tesis")]
    public async Task<IActionResult> MiTesis()
    {
        var clave = await MiClave();
        if (clave == null) return NotFound(new { mensaje = "Tu cuenta no está asociada a un alumno." });
        var t = await Consulta().AsNoTracking().SingleOrDefaultAsync(x => x.clave_alumno == clave);
        // Sin tesis aún no es un error: es el estado inicial que el formulario de alta
        // espera encontrar.
        if (t == null) return Ok(new { tesis = (object?)null, claveAlumno = clave });
        return Ok(await Ficha(t));
    }

    private async Task<object> Ficha(tesi t)
    {
        var revisiones = await db.revisions.AsNoTracking()
            .Include(r => r.id_periodoNavigation).Include(r => r.acuerdo_evaluacions)
            .Where(r => r.id_tesis == t.id_tesis)
            .OrderByDescending(r => r.fecha).ThenByDescending(r => r.id_revision)
            .ToListAsync();
        // El comité se lee aparte porque cuelga de `comite`, no de `tesis` directamente.
        var comite = await db.comites.AsNoTracking()
            .Where(c => c.id_tesis == t.id_tesis)
            .SelectMany(c => c.comite_profesors.Where(cp => cp.activo == true))
            .Select(cp => new {
                rpe = cp.rpe,
                profesor = cp.rpeNavigation.nombre + " " + cp.rpeNavigation.apellido_paterno,
                rol = cp.id_rol_comiteNavigation.nombre
            }).ToListAsync();
        return new { tesis = Vista(t), comite, revisiones = revisiones.Select(VistaRevision) };
    }

    // -----------------------------------------------------------------
    // RF-01.10.1 · Alta
    // -----------------------------------------------------------------

    /// <summary>
    /// El tesista presenta su solicitud de tesis. Siguiendo el diagrama del AMyD,
    /// esto NO da de alta la tesis: crea el registro en estado «Pendiente» con el
    /// director propuesto, a la espera de su resolución.
    /// </summary>
    [HttpPost("mi-tesis")]
    public async Task<IActionResult> SolicitarMiTesis(SolicitudTesisInput input)
    {
        var clave = await MiClave();
        if (clave == null) return NotFound(new { mensaje = "Tu cuenta no está asociada a un alumno." });

        await using var tx = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.ReadCommitted);
        var alumno = await db.alumnos.SingleOrDefaultAsync(a => a.clave_alumno == clave);
        if (alumno == null) return NotFound(new { mensaje = "Ese alumno no existe." });

        // Una solicitud a la vez. Si la anterior fue rechazada, el diagrama pide
        // «Solicitar selección de nuevo Director», así que esa sí se puede reemplazar.
        var previa = await db.teses.SingleOrDefaultAsync(t => t.clave_alumno == clave);
        if (previa != null && previa.estado_solicitud != EstadoSolicitudTesis.Rechazada)
            return Conflict(new { mensaje = previa.estado_solicitud == EstadoSolicitudTesis.Pendiente
                ? "Ya tienes una solicitud pendiente de resolución."
                : "Ya tienes una tesis registrada." });

        var error = await ValidarSolicitud(input);
        if (error != null) return Conflict(new { mensaje = error });

        var inicial = await db.CAT_estado_teses.Where(e => e.nombre == "Sin iniciar")
            .Select(e => (int?)e.id_estado_tesis).SingleOrDefaultAsync();
        if (inicial == null)
            return StatusCode(503, new { mensaje = "El catálogo de estados de tesis no está cargado." });

        var t = previa ?? new tesi { clave_alumno = clave.Value };
        t.titulo = input.Titulo.Trim();
        t.resumen = string.IsNullOrWhiteSpace(input.Resumen) ? null : input.Resumen.Trim();
        t.linea_investigacion = input.LineaInvestigacion.Trim();
        t.id_modalidad = input.ModalidadId;
        t.rpe_director = input.DirectorRpe;
        t.id_programa = alumno.id_programa;
        t.id_estado_tesis = inicial;
        t.porcentaje_actual = 0m;
        t.estado_solicitud = EstadoSolicitudTesis.Pendiente;
        t.fecha_solicitud = DateTime.UtcNow.Date;
        // Una solicitud nueva borra el rastro de la anterior.
        t.fecha_resolucion = null;
        t.motivo_rechazo = null;
        // `fecha_registro` es la del registro OFICIAL: se pone al aceptar, no ahora.
        t.fecha_registro = null;
        t.ultima_actualizacion = DateTime.UtcNow;
        if (previa == null) db.teses.Add(t);

        await db.SaveChangesAsync();
        await tx.CommitAsync();
        return Created($"/api/tesis/{t.id_tesis}", new {
            id = t.id_tesis,
            mensaje = "Solicitud enviada. El director propuesto debe revisarla."
        });
    }

    private async Task<string?> ValidarSolicitud(SolicitudTesisInput input)
    {
        if (!await db.CAT_modalidad_titulacions.AnyAsync(m => m.id_modalidad == input.ModalidadId && m.activo == true))
            return "Selecciona una modalidad de titulación activa.";
        // El diagrama valida explícitamente «Existencia del Director».
        if (!await db.profesors.AnyAsync(p => p.rpe == input.DirectorRpe))
            return "El director propuesto no existe en la planta docente.";
        return null;
    }

    // -----------------------------------------------------------------
    // Resolución del director
    //
    // El diagrama dice «Notificar al Director propuesto». El proyecto no tiene
    // sistema de notificaciones, así que la notificación es que la solicitud
    // aparezca en su bandeja: el director consulta las suyas y resuelve.
    // -----------------------------------------------------------------

    /// <summary>RPE del profesor en sesión, o null si la cuenta no es de un profesor.</summary>
    private async Task<int?> MiRpe() =>
        await db.profesor_detalles.Where(d => d.id_usuario == User.IdUsuarioRequerido() && d.activo == true)
            .Select(d => (int?)d.rpe).SingleOrDefaultAsync();

    /// <summary>Solicitudes que esperan la resolución del director en sesión.</summary>
    [HttpGet("solicitudes")]
    public async Task<IActionResult> MisSolicitudes()
    {
        var rpe = await MiRpe();
        // El coordinador ve todas las pendientes; el profesor solo las suyas.
        if (rpe == null && !EsGestor())
            return Forbid();
        var q = Consulta().AsNoTracking()
            .Where(t => t.estado_solicitud == EstadoSolicitudTesis.Pendiente);
        if (rpe != null && !EsGestor()) q = q.Where(t => t.rpe_director == rpe);
        var filas = await q.OrderBy(t => t.fecha_solicitud).ToListAsync();
        return Ok(new { total = filas.Count, solicitudes = filas.Select(Vista) });
    }

    /// <summary>
    /// El director acepta o rechaza. Si acepta, se genera el registro oficial y la
    /// tesis pasa a «En progreso», tal como marca el diagrama. Si rechaza, queda el
    /// motivo para que el tesista proponga otro director.
    /// </summary>
    [HttpPut("{id:int}/solicitud")]
    public async Task<IActionResult> Resolver(int id, ResolucionTesisInput input)
    {
        await using var tx = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.ReadCommitted);
        var t = (await db.teses.FromSqlInterpolated(
            $"SELECT * FROM tesis WHERE id_tesis = {id} FOR UPDATE").ToListAsync()).SingleOrDefault();
        if (t == null) return NotFound(new { mensaje = "Esa tesis no existe." });
        if (t.estado_solicitud != EstadoSolicitudTesis.Pendiente)
            return Conflict(new { mensaje = $"Esa solicitud ya está «{t.estado_solicitud}»." });

        // Solo el director propuesto resuelve su propia solicitud. El coordinador
        // puede hacerlo también, para desbloquear casos en que el profesor no entre.
        var rpe = await MiRpe();
        if (!EsGestor() && (rpe == null || rpe != t.rpe_director))
            return Forbid();

        if (!input.Aceptar && string.IsNullOrWhiteSpace(input.MotivoRechazo))
            return BadRequest(new { mensaje = "Indica el motivo del rechazo." });

        t.fecha_resolucion = DateTime.UtcNow.Date;
        if (input.Aceptar)
        {
            t.estado_solicitud = EstadoSolicitudTesis.Aceptada;
            t.motivo_rechazo = null;
            // «Generar registro oficial de tesis» y «Asignar estado En proceso».
            t.fecha_registro = DateTime.UtcNow.Date;
            var enProgreso = await db.CAT_estado_teses.Where(e => e.nombre == "En progreso")
                .Select(e => (int?)e.id_estado_tesis).SingleOrDefaultAsync();
            if (enProgreso == null)
                return StatusCode(503, new { mensaje = "Falta el estado «En progreso» en el catálogo." });
            t.id_estado_tesis = enProgreso;
        }
        else
        {
            t.estado_solicitud = EstadoSolicitudTesis.Rechazada;
            t.motivo_rechazo = input.MotivoRechazo!.Trim();
            // El director rechazado deja de estar propuesto: el tesista elige otro.
            t.rpe_director = null;
        }
        t.ultima_actualizacion = DateTime.UtcNow;

        await db.SaveChangesAsync();
        await tx.CommitAsync();
        return Ok(new { mensaje = input.Aceptar
            ? "Solicitud aceptada. La tesis quedó registrada y en progreso."
            : "Solicitud rechazada. El tesista podrá proponer otro director." });
    }

    // -----------------------------------------------------------------
    // RF-01.10.6 · Asignación de comité por el director
    //
    // El diagrama `diagrama Asignación de comité por el director de tesis.png`
    // arranca con «El Director de tesis inicia sesión», consulta sus tesistas
    // asignados y elige codirector y sinodales. Aquí se implementa esa vía.
    //
    // ComitesController conserva la suya, la del coordinador, que corresponde al
    // otro diagrama («Alta de comité tutorial»). Las dos acaban en las mismas
    // tablas y la que llegue segunda recibe el conflicto.
    //
    // Diferencia deliberada entre ambas: aquí la clave del comité la genera el
    // servidor, como piden los dos diagramas. En la vía del coordinador se sigue
    // tecleando, porque cambiar su contrato rompería su interfaz.
    // -----------------------------------------------------------------

    /// <summary>
    /// Tesis que dirige el profesor en sesión, ya aceptadas. Es el «consultar
    /// tesistas asignados» del diagrama, y señala cuáles esperan comité.
    /// </summary>
    [HttpGet("mis-tesistas")]
    public async Task<IActionResult> MisTesistas()
    {
        var rpe = await MiRpe();
        if (rpe == null && !EsGestor()) return Forbid();
        var q = Consulta().AsNoTracking()
            .Where(t => t.estado_solicitud == EstadoSolicitudTesis.Aceptada);
        if (rpe != null && !EsGestor()) q = q.Where(t => t.rpe_director == rpe);
        var filas = await q.OrderBy(t => t.clave_alumno).ToListAsync();
        var ids = filas.Select(t => t.id_tesis).ToArray();
        var conComite = await db.comites.Where(c => ids.Contains(c.id_tesis))
            .Select(c => c.id_tesis).ToListAsync();
        return Ok(new {
            total = filas.Count,
            tesis = filas.Select(t => new { vista = Vista(t), tieneComite = conComite.Contains(t.id_tesis) })
        });
    }

    /// <summary>
    /// El director arma el comité de una de sus tesis. Él no se elige a sí mismo:
    /// ya consta como director por haber aceptado la solicitud.
    /// </summary>
    [HttpPost("{id:int}/comite")]
    public async Task<IActionResult> AsignarComite(int id, AsignacionComiteInput input)
    {
        await using var tx = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.ReadCommitted);
        var t = (await db.teses.FromSqlInterpolated(
            $"SELECT * FROM tesis WHERE id_tesis = {id} FOR UPDATE").ToListAsync()).SingleOrDefault();
        if (t == null) return NotFound(new { mensaje = "Esa tesis no existe." });

        var rpe = await MiRpe();
        if (!EsGestor() && (rpe == null || rpe != t.rpe_director))
            return Forbid();
        if (t.estado_solicitud != EstadoSolicitudTesis.Aceptada)
            return Conflict(new { mensaje = "La tesis todavía no tiene una solicitud aceptada." });
        if (t.rpe_director == null)
            return Conflict(new { mensaje = "La tesis no tiene director asignado." });
        if (await db.comites.AnyAsync(c => c.id_tesis == id))
            return Conflict(new { mensaje = "Esa tesis ya tiene un comité tutorial asignado." });

        // Validaciones que pide el diagrama: no repetición e integrantes distintos
        // del director.
        var director = t.rpe_director.Value;
        if (input.SinodalesRpe.Distinct().Count() != input.SinodalesRpe.Length)
            return Conflict(new { mensaje = "No puedes repetir un profesor entre los sinodales." });
        if (input.SinodalesRpe.Contains(director) || input.CodirectorRpe == director ||
            (input.CodirectorRpe != null && input.SinodalesRpe.Contains(input.CodirectorRpe.Value)))
            return Conflict(new { mensaje = "Cada integrante debe ser un profesor distinto." });

        var integrantes = input.SinodalesRpe
            .Concat(input.CodirectorRpe.HasValue ? [input.CodirectorRpe.Value] : [])
            .Append(director).Distinct().ToArray();
        // «Profesores activos»: el diagrama lo pide explícitamente, así que se
        // comprueba contra profesor_detalle y no solo la existencia en `profesor`.
        var activos = await db.profesor_detalles
            .Where(d => integrantes.Contains(d.rpe) && d.activo == true)
            .Select(d => d.rpe).Distinct().ToListAsync();
        if (activos.Count != integrantes.Length)
            return Conflict(new { mensaje = "Uno o más profesores no existen o no están activos." });

        var roles = await db.CAT_rol_comites
            .Where(r => r.nombre == "Director" || r.nombre == "Codirector" || r.nombre == "Asesor")
            .ToDictionaryAsync(r => r.nombre, r => r.id_rol_comite);
        if (!roles.ContainsKey("Director") || !roles.ContainsKey("Asesor") ||
            (input.CodirectorRpe.HasValue && !roles.ContainsKey("Codirector")))
            return StatusCode(503, new { mensaje = "Faltan roles de comité en el catálogo." });

        // Clave única generada por el servidor, como piden los diagramas.
        // Se numera por año para que sea legible y no se repita entre generaciones.
        var anio = DateTime.UtcNow.Year;
        var prefijo = $"CT-{anio}-";
        var ultimo = await db.comites.Where(c => c.tipo != null && c.tipo.StartsWith(prefijo))
            .OrderByDescending(c => c.tipo).Select(c => c.tipo).FirstOrDefaultAsync();
        var consecutivo = 1;
        if (ultimo != null && int.TryParse(ultimo[prefijo.Length..], out var n)) consecutivo = n + 1;
        var clave = prefijo + consecutivo.ToString("D4");

        var comite = new comite { id_tesis = id, tipo = clave };
        db.comites.Add(comite);

        var fecha = DateTime.UtcNow.Date;
        void Integrante(int profesorRpe, string rol) =>
            db.comite_profesors.Add(new comite_profesor {
                id_comiteNavigation = comite, rpe = profesorRpe,
                id_rol_comite = roles[rol], fecha_asignacion = fecha, activo = true
            });

        Integrante(director, "Director");
        if (input.CodirectorRpe.HasValue) Integrante(input.CodirectorRpe.Value, "Codirector");
        foreach (var sinodal in input.SinodalesRpe) Integrante(sinodal, "Asesor");

        t.ultima_actualizacion = DateTime.UtcNow;

        try { await db.SaveChangesAsync(); await tx.CommitAsync(); }
        catch (DbUpdateException ex) when (ex.InnerException is MySqlException { Number: 1062 })
        { return Conflict(new { mensaje = "Esa tesis ya tiene un comité, o un integrante está repetido." }); }

        return Created($"/api/tesis/{id}", new {
            id = comite.id_comite, clave,
            mensaje = $"Comité {clave} asignado. La tesis ya puede recibir evaluaciones."
        });
    }

    /// <summary>
    /// El coordinador registra una tesis directamente, sin circuito de aprobación.
    /// Es la vía administrativa para tesis anteriores al sistema o para desbloquear
    /// casos en que el director no pueda resolver.
    /// </summary>
    [HttpPost("{clave:int}"), Authorize(Policy = "GestionUsuarios")]
    public async Task<IActionResult> Registrar(int clave, AltaTesisInput input) => await Alta(clave, input);

    private async Task<IActionResult> Alta(int clave, AltaTesisInput input)
    {
        await using var tx = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.ReadCommitted);
        var alumno = await db.alumnos.SingleOrDefaultAsync(a => a.clave_alumno == clave);
        if (alumno == null) return NotFound(new { mensaje = "Ese alumno no existe." });
        if (await db.teses.AnyAsync(t => t.clave_alumno == clave))
            return Conflict(new { mensaje = "Ese alumno ya tiene una tesis registrada." });

        var inicial = await db.CAT_estado_teses
            .Where(e => e.nombre == "Sin iniciar")
            .Select(e => (int?)e.id_estado_tesis).SingleOrDefaultAsync();
        if (inicial == null)
            return StatusCode(503, new { mensaje = "El catálogo de estados de tesis no está cargado." });

        var t = new tesi {
            titulo = input.Titulo.Trim(),
            resumen = string.IsNullOrWhiteSpace(input.Resumen) ? null : input.Resumen.Trim(),
            clave_alumno = clave,
            id_programa = alumno.id_programa,
            id_modalidad = alumno.id_modalidad,
            id_estado_tesis = inicial,
            porcentaje_actual = 0m,
            // Alta administrativa: nace aceptada, sin pasar por el circuito.
            estado_solicitud = EstadoSolicitudTesis.Aceptada,
            fecha_solicitud = DateTime.UtcNow.Date,
            fecha_resolucion = DateTime.UtcNow.Date,
            fecha_registro = DateTime.UtcNow.Date,
            ultima_actualizacion = DateTime.UtcNow
        };
        db.teses.Add(t);
        try { await db.SaveChangesAsync(); await tx.CommitAsync(); }
        catch (DbUpdateException ex) when (ex.InnerException is MySqlException { Number: 1062 })
        { return Conflict(new { mensaje = "Ese alumno ya tiene una tesis registrada." }); }
        return Created($"/api/tesis/{t.id_tesis}", new { id = t.id_tesis, mensaje = "Tesis registrada." });
    }

    // -----------------------------------------------------------------
    // RF-01.10.3 · Actualización
    // -----------------------------------------------------------------

    /// <summary>
    /// El tesista corrige su título y resumen. No puede tocar estado ni porcentaje:
    /// esos los fija el comité, así que se conservan los que ya tuviera.
    /// </summary>
    [HttpPut("mi-tesis")]
    public async Task<IActionResult> ActualizarMiTesis(AltaTesisInput input)
    {
        var clave = await MiClave();
        if (clave == null) return NotFound(new { mensaje = "Tu cuenta no está asociada a un alumno." });
        await using var tx = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.ReadCommitted);
        var t = await db.teses.SingleOrDefaultAsync(x => x.clave_alumno == clave);
        if (t == null) return NotFound(new { mensaje = "Todavía no has registrado tu tesis." });
        t.titulo = input.Titulo.Trim();
        t.resumen = string.IsNullOrWhiteSpace(input.Resumen) ? null : input.Resumen.Trim();
        t.ultima_actualizacion = DateTime.UtcNow;
        await db.SaveChangesAsync(); await tx.CommitAsync();
        return Ok(new { mensaje = "Tesis actualizada." });
    }

    /// <summary>El coordinador actualiza también estado y porcentaje.</summary>
    [HttpPut("{id:int}"), Authorize(Policy = "GestionUsuarios")]
    public async Task<IActionResult> Actualizar(int id, EdicionTesisInput input)
    {
        await using var tx = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.ReadCommitted);
        var t = await db.teses.SingleOrDefaultAsync(x => x.id_tesis == id);
        if (t == null) return NotFound(new { mensaje = "Esa tesis no existe." });
        if (!await db.CAT_estado_teses.AnyAsync(e => e.id_estado_tesis == input.EstadoTesisId))
            return Conflict(new { mensaje = "Selecciona un estado de tesis válido." });
        t.titulo = input.Titulo.Trim();
        t.resumen = string.IsNullOrWhiteSpace(input.Resumen) ? null : input.Resumen.Trim();
        t.id_estado_tesis = input.EstadoTesisId;
        t.porcentaje_actual = input.PorcentajeActual;
        t.ultima_actualizacion = DateTime.UtcNow;
        await db.SaveChangesAsync(); await tx.CommitAsync();
        return Ok(new { mensaje = "Tesis actualizada." });
    }

    // -----------------------------------------------------------------
    // RF-01.10.4 · Seguimiento del avance
    // -----------------------------------------------------------------

    /// <summary>
    /// Registra una revisión del comité y, si trae compromisos, su acuerdo.
    /// El porcentaje de la revisión se propaga a la tesis en la misma transacción:
    /// de lo contrario el indicador de avance y la última evaluación podrían
    /// contradecirse.
    /// </summary>
    [HttpPost("{id:int}/revisiones"), Authorize(Policy = "GestionUsuarios")]
    public async Task<IActionResult> RegistrarRevision(int id, RevisionInput input)
    {
        if (input.Fecha.Date > DateTime.UtcNow.Date)
            return BadRequest(new { mensaje = "La fecha de la revisión no puede ser futura." });

        await using var tx = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.ReadCommitted);
        var t = await db.teses.SingleOrDefaultAsync(x => x.id_tesis == id);
        if (t == null) return NotFound(new { mensaje = "Esa tesis no existe." });
        // Una tesis no puede recibir revisiones antes de tener comité: es el comité
        // quien evalúa, así que sin él no hay quién avale el avance.
        if (!await db.comites.AnyAsync(c => c.id_tesis == id))
            return Conflict(new { mensaje = "Esta tesis todavía no tiene comité tutorial asignado. El director debe asignarlo antes de registrar avances." });
        if (input.PeriodoId != null && !await db.periodo_academicos.AnyAsync(p => p.id_periodo == input.PeriodoId))
            return Conflict(new { mensaje = "Selecciona un periodo académico válido." });

        var r = new revision {
            id_tesis = id,
            fecha = input.Fecha.Date,
            porcentaje_avance = input.PorcentajeAvance,
            criterios = string.IsNullOrWhiteSpace(input.Criterios) ? null : input.Criterios.Trim(),
            comentarios = string.IsNullOrWhiteSpace(input.Comentarios) ? null : input.Comentarios.Trim(),
            estado = string.IsNullOrWhiteSpace(input.Estado) ? null : input.Estado.Trim(),
            id_periodo = input.PeriodoId
        };
        db.revisions.Add(r);

        if (!string.IsNullOrWhiteSpace(input.Compromisos))
            db.acuerdo_evaluacions.Add(new acuerdo_evaluacion {
                id_revisionNavigation = r,
                descripcion = input.Compromisos.Trim(),
                fecha_compromiso = input.FechaCompromiso?.Date,
                cumplido = false
            });

        t.porcentaje_actual = input.PorcentajeAvance;
        t.ultima_actualizacion = DateTime.UtcNow;

        await db.SaveChangesAsync(); await tx.CommitAsync();
        return Created($"/api/tesis/{id}/revisiones/{r.id_revision}",
            new { id = r.id_revision, mensaje = "Revisión registrada." });
    }

    /// <summary>Marca un compromiso como cumplido o pendiente.</summary>
    [HttpPut("compromisos/{idAcuerdo:int}"), Authorize(Policy = "GestionUsuarios")]
    public async Task<IActionResult> ActualizarCompromiso(int idAcuerdo, [FromQuery] bool cumplido)
    {
        var a = await db.acuerdo_evaluacions.SingleOrDefaultAsync(x => x.id_acuerdo == idAcuerdo);
        if (a == null) return NotFound(new { mensaje = "Ese compromiso no existe." });
        a.cumplido = cumplido;
        await db.SaveChangesAsync();
        return Ok(new { mensaje = cumplido ? "Compromiso marcado como cumplido." : "Compromiso reabierto." });
    }
}
