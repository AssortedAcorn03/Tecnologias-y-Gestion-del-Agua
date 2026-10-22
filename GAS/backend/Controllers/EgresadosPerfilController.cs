using backend.Auth;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace backend.Controllers;

/// <summary>Datos personales y de contacto del egresado (RF-02.3).</summary>
public record PerfilEgresadoInput(
    [Required, EmailAddress, MaxLength(100)] string Correo,
    [MaxLength(20), RegularExpression(@"^[0-9+\-() ]{8,20}$")] string? Telefono,
    [MaxLength(100)] string? Ciudad,
    [MaxLength(255)] string? OtrosContactos);

/// <summary>Un registro del historial laboral del egresado (RF-02.4).</summary>
public record EmpleoEgresadoInput(
    [Required, MaxLength(150)] string Empresa,
    [MaxLength(100)] string? Sector,
    [MaxLength(100)] string? Ciudad,
    [Required, MaxLength(100)] string Puesto,
    [MaxLength(100)] string? AreaProfesional,
    [Range(1, int.MaxValue)] int SituacionLaboralId,
    [Required] DateTime FechaInicio,
    DateTime? FechaFinal,
    [Range(0, 9999999.99)] decimal? Sueldo,
    bool RelacionPosgrado,
    bool TrabajoActual,
    string? Actividades);

/// <summary>
/// Actualización de los datos del egresado: personales (RF-02.3) e historial
/// laboral (RF-02.4).
///
/// Vive aparte de EgresadosController porque atiende a DOS audiencias con
/// permisos distintos, y porque ese controlador es de otra persona:
///
///   · El propio egresado, desde su portal, sobre /mi-perfil. Los diagramas del
///     AMyD empiezan con «El egresado inicia sesión», así que el autoservicio es
///     el flujo principal. Nunca recibe una clave por parámetro: se resuelve de
///     su sesión, para que no pueda editar a otro.
///
///   · El coordinador, sobre /{clave}, para corregir datos que el egresado
///     reporte por teléfono o correo.
///
/// Ambas vías comparten el mismo núcleo de validación y escritura.
///
/// Sobre el «registrar cambios en historial» de los diagramas: el historial
/// laboral ES la tabla `empleo` + `detalle_empleo`, donde cada empleo es un
/// registro nuevo que no sobrescribe a los anteriores. Para los datos
/// personales no hay bitácora de campos; se sella `ultima_actualizacion`.
/// </summary>
[ApiController, Route("api/egresados"), Authorize]
public class EgresadosPerfilController(GasDbContext db) : ControllerBase
{
    // -----------------------------------------------------------------
    // Resolución de identidad
    // -----------------------------------------------------------------

    /// <summary>
    /// Clave del egresado que ha iniciado sesión, o null si la cuenta no tiene
    /// un registro de egresado asociado.
    /// </summary>
    private async Task<int?> MiClave()
    {
        var idUsuario = User.IdUsuarioRequerido();
        return await db.egresados
            .Where(e => e.clave_alumnoNavigation.id_usuario == idUsuario)
            .Select(e => (int?)e.clave_alumno)
            .SingleOrDefaultAsync();
    }

    private bool EsGestor() => User.IsInRole(Roles.Administrador) || User.IsInRole(Roles.Coordinador);

    private static object Vista(egresado e) => new {
        claveAlumno = e.clave_alumno,
        identificador = e.identificador_egresado,
        nombre = string.Join(' ', new[] { e.clave_alumnoNavigation?.nombre,
            e.clave_alumnoNavigation?.apellido_paterno, e.clave_alumnoNavigation?.apellido_materno }
            .Where(s => !string.IsNullOrWhiteSpace(s))),
        e.correo, e.telefono, e.ciudad, otrosContactos = e.otros_contactos,
        fechaEgreso = e.fecha_egreso,
        localizable = e.localizable == true,
        estado = e.id_estado_egresadoNavigation?.nombre,
        ultimaActualizacion = e.ultima_actualizacion
    };

    private static object VistaEmpleo(empleo em) => new {
        id = em.id_empleo,
        empresa = em.id_empresaNavigation?.nombre,
        sector = em.id_empresaNavigation?.sector,
        ciudad = em.id_empresaNavigation?.ciudad,
        areaProfesional = em.area_profesional,
        situacionLaboralId = em.id_situacion_laboral,
        situacionLaboral = em.id_situacion_laboralNavigation?.nombre,
        trabajoActual = em.trabajo_actual == true,
        detalles = em.detalle_empleos.OrderByDescending(d => d.fecha_inicio).Select(d => new {
            id = d.id_detalle_empleo, d.puesto, fechaInicio = d.fecha_inicio,
            fechaFinal = d.fecha_final, d.sueldo,
            relacionPosgrado = d.relacion_posgrado == true, d.actividades
        })
    };

    private IQueryable<egresado> ConsultaEgresado() => db.egresados
        .Include(e => e.clave_alumnoNavigation)
        .Include(e => e.id_estado_egresadoNavigation);

    private IQueryable<empleo> ConsultaEmpleos() => db.empleos
        .Include(em => em.id_empresaNavigation)
        .Include(em => em.id_situacion_laboralNavigation)
        .Include(em => em.detalle_empleos);

    // -----------------------------------------------------------------
    // RF-02.3 · Datos personales
    // -----------------------------------------------------------------

    /// <summary>Datos actuales del egresado en sesión, para precargar el formulario.</summary>
    [HttpGet("mi-perfil")]
    public async Task<IActionResult> MiPerfil()
    {
        var clave = await MiClave();
        if (clave == null) return NotFound(new { mensaje = "No existe registro del egresado." });
        var e = await ConsultaEgresado().AsNoTracking().SingleAsync(x => x.clave_alumno == clave);
        return Ok(Vista(e));
    }

    [HttpPut("mi-perfil")]
    public async Task<IActionResult> ActualizarMiPerfil(PerfilEgresadoInput input)
    {
        var clave = await MiClave();
        if (clave == null) return NotFound(new { mensaje = "No existe registro del egresado." });
        return await GuardarPerfil(clave.Value, input);
    }

    /// <summary>Misma operación, hecha por el coordinador sobre cualquier egresado.</summary>
    [HttpPut("{clave:int}/perfil"), Authorize(Policy = "GestionUsuarios")]
    public async Task<IActionResult> ActualizarPerfil(int clave, PerfilEgresadoInput input) =>
        await GuardarPerfil(clave, input);

    private async Task<IActionResult> GuardarPerfil(int clave, PerfilEgresadoInput input)
    {
        await using var tx = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.ReadCommitted);
        var e = (await db.egresados.FromSqlInterpolated(
            $"SELECT * FROM egresado WHERE clave_alumno = {clave} FOR UPDATE").ToListAsync()).SingleOrDefault();
        if (e == null) return NotFound(new { mensaje = "No existe registro del egresado." });

        var correo = input.Correo.Trim().ToLowerInvariant();
        // `egresado.correo` es de contacto y no tiene restricción de unicidad, pero
        // conviene avisar si choca con el de otro egresado: casi siempre es un error
        // de captura, no dos personas compartiendo buzón.
        if (await db.egresados.AnyAsync(x => x.clave_alumno != clave && x.correo == correo))
            return Conflict(new { mensaje = "Ese correo ya está registrado para otro egresado." });

        e.correo = correo;
        e.telefono = string.IsNullOrWhiteSpace(input.Telefono) ? null : input.Telefono.Trim();
        e.ciudad = string.IsNullOrWhiteSpace(input.Ciudad) ? null : input.Ciudad.Trim();
        e.otros_contactos = string.IsNullOrWhiteSpace(input.OtrosContactos) ? null : input.OtrosContactos.Trim();
        // Sella la fecha: es lo que permite el seguimiento periódico (RF-02.7) y
        // distinguir a quien mantiene sus datos al día de quien lleva años sin tocarlos.
        e.ultima_actualizacion = DateTime.UtcNow.Date;
        // Si estaba marcado como no localizable y acaba de actualizar sus datos,
        // por definición vuelve a serlo.
        if (e.localizable != true) e.localizable = true;

        await db.SaveChangesAsync();
        await tx.CommitAsync();
        return Ok(new { mensaje = "Datos actualizados." });
    }

    // -----------------------------------------------------------------
    // RF-02.4 · Historial laboral
    // -----------------------------------------------------------------

    [HttpGet("mi-perfil/empleos")]
    public async Task<IActionResult> MisEmpleos()
    {
        var clave = await MiClave();
        if (clave == null) return NotFound(new { mensaje = "No existe registro del egresado." });
        return Ok(await ListarEmpleos(clave.Value));
    }

    [HttpGet("{clave:int}/empleos"), Authorize(Policy = "GestionUsuarios")]
    public async Task<IActionResult> Empleos(int clave) => Ok(await ListarEmpleos(clave));

    private async Task<object> ListarEmpleos(int clave)
    {
        var empleos = await ConsultaEmpleos().AsNoTracking()
            .Where(em => em.clave_alumno == clave)
            // El trabajo actual primero; el resto, del más reciente al más antiguo.
            .OrderByDescending(em => em.trabajo_actual)
            .ThenByDescending(em => em.id_empleo)
            .ToListAsync();
        return new { total = empleos.Count, empleos = empleos.Select(VistaEmpleo) };
    }

    [HttpPost("mi-perfil/empleos")]
    public async Task<IActionResult> AgregarMiEmpleo(EmpleoEgresadoInput input)
    {
        var clave = await MiClave();
        if (clave == null) return NotFound(new { mensaje = "No existe registro del egresado." });
        return await GuardarEmpleo(clave.Value, null, input);
    }

    [HttpPost("{clave:int}/empleos"), Authorize(Policy = "GestionUsuarios")]
    public async Task<IActionResult> AgregarEmpleo(int clave, EmpleoEgresadoInput input) =>
        await GuardarEmpleo(clave, null, input);

    [HttpPut("mi-perfil/empleos/{id:int}")]
    public async Task<IActionResult> ActualizarMiEmpleo(int id, EmpleoEgresadoInput input)
    {
        var clave = await MiClave();
        if (clave == null) return NotFound(new { mensaje = "No existe registro del egresado." });
        return await GuardarEmpleo(clave.Value, id, input);
    }

    [HttpPut("{clave:int}/empleos/{id:int}"), Authorize(Policy = "GestionUsuarios")]
    public async Task<IActionResult> ActualizarEmpleo(int clave, int id, EmpleoEgresadoInput input) =>
        await GuardarEmpleo(clave, id, input);

    /// <summary>
    /// Alta o modificación de un registro laboral. `idEmpleo` nulo significa alta.
    /// Siempre recibe la clave resuelta por quien llama, nunca del cuerpo de la
    /// petición: así un egresado no puede escribir en el historial de otro.
    /// </summary>
    private async Task<IActionResult> GuardarEmpleo(int clave, int? idEmpleo, EmpleoEgresadoInput input)
    {
        if (input.FechaFinal != null && input.FechaFinal < input.FechaInicio)
            return BadRequest(new { mensaje = "La fecha de fin no puede ser anterior a la de inicio." });
        if (input.TrabajoActual && input.FechaFinal != null)
            return BadRequest(new { mensaje = "Un empleo marcado como actual no puede tener fecha de fin." });
        if (!await db.egresados.AnyAsync(e => e.clave_alumno == clave))
            return NotFound(new { mensaje = "No existe registro del egresado." });
        if (!await db.CAT_situacion_laborals.AnyAsync(s => s.id_situacion_laboral == input.SituacionLaboralId))
            return Conflict(new { mensaje = "Selecciona una situación laboral válida." });

        await using var tx = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.ReadCommitted);

        // La empresa se reutiliza si ya está registrada, para no llenar el catálogo
        // de duplicados cada vez que un egresado teclea el mismo nombre.
        var nombreEmpresa = input.Empresa.Trim();
        var empresa = await db.empresas.FirstOrDefaultAsync(x => x.nombre == nombreEmpresa);
        if (empresa == null)
        {
            empresa = new empresa { nombre = nombreEmpresa, sector = input.Sector?.Trim(), ciudad = input.Ciudad?.Trim() };
            db.empresas.Add(empresa);
        }
        else
        {
            // Completa datos que faltaran, sin pisar los que ya hubiera.
            empresa.sector ??= input.Sector?.Trim();
            empresa.ciudad ??= input.Ciudad?.Trim();
        }

        empleo registro;
        detalle_empleo detalle;
        if (idEmpleo == null)
        {
            registro = new empleo { clave_alumno = clave };
            db.empleos.Add(registro);
            detalle = new detalle_empleo { id_empleoNavigation = registro };
            db.detalle_empleos.Add(detalle);
        }
        else
        {
            var existente = await db.empleos.Include(em => em.detalle_empleos)
                .SingleOrDefaultAsync(em => em.id_empleo == idEmpleo && em.clave_alumno == clave);
            if (existente == null) return NotFound(new { mensaje = "Ese registro laboral no existe." });
            registro = existente;
            detalle = existente.detalle_empleos.OrderByDescending(d => d.fecha_inicio).FirstOrDefault()
                ?? new detalle_empleo { id_empleoNavigation = registro };
            if (detalle.id_detalle_empleo == 0) db.detalle_empleos.Add(detalle);
        }

        registro.id_empresaNavigation = empresa;
        registro.area_profesional = input.AreaProfesional?.Trim();
        registro.id_situacion_laboral = input.SituacionLaboralId;
        registro.trabajo_actual = input.TrabajoActual;
        registro.tipo = input.Sector?.Trim();

        detalle.puesto = input.Puesto.Trim();
        detalle.fecha_inicio = input.FechaInicio.Date;
        detalle.fecha_final = input.FechaFinal?.Date;
        detalle.sueldo = input.Sueldo;
        detalle.relacion_posgrado = input.RelacionPosgrado;
        detalle.actividades = string.IsNullOrWhiteSpace(input.Actividades) ? null : input.Actividades.Trim();

        // Solo puede haber un trabajo actual: marcar uno nuevo cierra los demás.
        // Se hace antes de guardar para que la consistencia sea parte de la misma
        // transacción.
        if (input.TrabajoActual)
        {
            var otros = await db.empleos
                .Where(em => em.clave_alumno == clave && em.trabajo_actual == true)
                .ToListAsync();
            foreach (var otro in otros.Where(o => o.id_empleo != registro.id_empleo))
                otro.trabajo_actual = false;
        }

        // Actualizar el historial laboral también cuenta como mantener los datos
        // al día, igual que actualizar los personales.
        var eg = await db.egresados.SingleAsync(e => e.clave_alumno == clave);
        eg.ultima_actualizacion = DateTime.UtcNow.Date;

        await db.SaveChangesAsync();
        await tx.CommitAsync();
        return idEmpleo == null
            ? Created($"/api/egresados/{clave}/empleos/{registro.id_empleo}",
                new { id = registro.id_empleo, mensaje = "Registro laboral agregado." })
            : Ok(new { id = registro.id_empleo, mensaje = "Registro laboral actualizado." });
    }
}
