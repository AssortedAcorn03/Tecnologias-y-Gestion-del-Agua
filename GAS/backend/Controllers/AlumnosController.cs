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

public record BusquedaExternaInput(
    [Required, MinLength(1), MaxLength(UniversidadExterna.MaxClaves)] int[] Claves);

/// <summary>Los datos que el coordinador completa; la identidad viene de la universidad.</summary>
public record AlumnoDatosInput(
    [Required] DateTime FechaIngreso,
    [Range(1, int.MaxValue)] int ProgramaId,
    [Range(1, int.MaxValue)] int GeneracionId,
    [Range(1, int.MaxValue)] int ModalidadId,
    [Range(1, int.MaxValue)] int EstadoAcademicoId,
    [Range(1, int.MaxValue)] int PeriodoId,
    [Range(1, 20)] int Semestre,
    [Required, EmailAddress, MaxLength(100)] string CorreoPersonal,
    [Required, MaxLength(20), RegularExpression(@"^[0-9+\-() ]{8,20}$")] string Telefono,
    bool Activo);

// Deliberadamente NO acepta nombre, apellidos ni correo institucional: esos cinco
// campos se releen de la base de la universidad en el servidor. Si viajaran desde
// el cliente, se podría "importar" un alumno inventado con cualquier clave.
public record FilaImportacionInput(
    [Range(UniversidadExterna.ClaveMinima, UniversidadExterna.ClaveMaxima)] int ClaveAlumno,
    [Required] AlumnoDatosInput Datos);

public record ImportacionInput(
    [Required, MinLength(1), MaxLength(UniversidadExterna.MaxClaves)] FilaImportacionInput[] Alumnos);

/// <summary>
/// Campos actualizables de un alumno (RF-01.3). Deliberadamente NO incluye clave,
/// nombre ni apellidos: la identidad la fija la universidad y corregirla ahí es
/// otra conversación. Faltan "información de tesis" y "estado del requisito TOEFL",
/// que el AMyD pide en RF-01.3 pero dependen de las tablas `tesis` y
/// `requisito_toefl` (RF-01.8 y RF-01.6), hoy vacías y de otro requerimiento.
/// </summary>
public record AlumnoEdicionInput(
    [Required, EmailAddress, MaxLength(100)] string CorreoInstitucional,
    [Required, EmailAddress, MaxLength(100)] string CorreoPersonal,
    [Required, MaxLength(20), RegularExpression(@"^[0-9+\-() ]{8,20}$")] string Telefono,
    [Range(1, 20)] int Semestre,
    [Range(1, int.MaxValue)] int PeriodoId,
    [Range(1, int.MaxValue)] int EstadoAcademicoId,
    [Range(1, int.MaxValue)] int ModalidadId,
    [Range(1, int.MaxValue)] int GeneracionId,
    bool Activo);

/// <summary>Alta directa, para el alumno que no esté en la base de la universidad.</summary>
public record AlumnoManualInput(
    [Range(UniversidadExterna.ClaveMinima, UniversidadExterna.ClaveMaxima)] int ClaveAlumno,
    [Required, MaxLength(50)] string Nombre,
    [Required, MaxLength(50)] string ApellidoPaterno,
    [MaxLength(50)] string? ApellidoMaterno,
    [Required, EmailAddress, MaxLength(100)] string CorreoInstitucional,
    [Required] AlumnoDatosInput Datos);

[ApiController, Route("api/alumnos"), Authorize(Policy = "GestionUsuarios")]
public class AlumnosController(GasDbContext db, UniversidadExterna universidad) : ControllerBase
{
    private const string EstatusBaja = "Baja";

    private static object Vista(alumno a) => new {
        claveAlumno = a.clave_alumno, a.nombre, apellidoPaterno = a.apellido_paterno,
        apellidoMaterno = a.apellido_materno, correoInstitucional = a.correo_institucional,
        correoPersonal = a.correo_personal, a.telefono, fechaIngreso = a.fecha_ingreso,
        activo = a.activo == true, usuarioId = a.id_usuario,
        programaId = a.id_programa, programa = a.id_programaNavigation?.nombre,
        generacionId = a.id_generacion, generacion = a.id_generacionNavigation?.nombre_generacion,
        modalidadId = a.id_modalidad, modalidad = a.id_modalidadNavigation?.nombre,
        estadoAcademicoId = a.id_estado_academico, estadoAcademico = a.id_estado_academicoNavigation?.nombre,
        // Inscripción más reciente: es el semestre y el periodo que el coordinador
        // espera ver. Requiere que quien llame haya hecho Include(a.alumno_detalles).
        semestre = a.alumno_detalles.OrderByDescending(d => d.id_periodo).Select(d => d.semestre).FirstOrDefault(),
        periodoId = a.alumno_detalles.OrderByDescending(d => d.id_periodo).Select(d => (int?)d.id_periodo).FirstOrDefault()
    };

    // Mismo mutex que usa toda escritura administrativa (ver UsuariosController):
    // serializa las altas para que las comprobaciones de unicidad sean fiables.
    private async Task Candado() => _ = await db.CAT_rol_usuarios
        .FromSqlRaw("SELECT * FROM CAT_rol_usuario ORDER BY id_rol_usuario FOR UPDATE").ToListAsync();

    /// <summary>null si los datos son válidos; si no, el mensaje para el coordinador.</summary>
    private async Task<string?> ValidarDatos(AlumnoDatosInput d)
    {
        if (!await db.CAT_programa_academicos.AnyAsync(p => p.id_programa == d.ProgramaId && p.activo == true))
            return "Selecciona un programa académico activo.";
        if (!await db.CAT_modalidad_titulacions.AnyAsync(m => m.id_modalidad == d.ModalidadId && m.activo == true))
            return "Selecciona una modalidad de titulación activa.";
        // CAT_estado_academico no tiene columna `activo`: solo se comprueba que exista.
        if (!await db.CAT_estado_academicos.AnyAsync(e => e.id_estado_academico == d.EstadoAcademicoId))
            return "Selecciona un estado académico válido.";
        // La generación debe pertenecer al programa elegido, no solo existir.
        if (!await db.generacions.AnyAsync(g => g.id_generacion == d.GeneracionId && g.id_programa == d.ProgramaId))
            return "La generación seleccionada no pertenece a ese programa académico.";
        if (!await db.periodo_academicos.AnyAsync(p => p.id_periodo == d.PeriodoId))
            return "Selecciona un periodo académico válido.";
        return null;
    }

    /// <summary>null si la clave y el correo están libres; si no, el motivo.</summary>
    private async Task<string?> ValidarIdentidad(int clave, string correoInstitucional)
    {
        if (await db.alumnos.AnyAsync(a => a.clave_alumno == clave))
            return "Ya existe un alumno con esa clave. Edítalo desde Consultar alumno.";
        // usuario.clave_institucional es UNIQUE: otro usuario podría tenerla ocupada.
        var claveTexto = clave.ToString();
        if (await db.usuarios.AnyAsync(u => u.clave_institucional == claveTexto))
            return "Esa clave ya está asignada a una cuenta de usuario distinta.";
        return null;
    }

    private record ResultadoAlta(bool Ok, string? Mensaje, int? UsuarioId, string? PasswordInicial);

    /// <summary>
    /// Da de alta un alumno: cuenta de acceso, registro académico e inscripción al
    /// periodo. Las tres filas son atómicas entre sí — un alumno con usuario pero
    /// sin registro académico sería invisible y ocuparía el correo único.
    /// Asume que ya se tomó el candado y se abrió la transacción.
    /// </summary>
    private async Task<ResultadoAlta> AltaAlumno(AlumnoExterno identidad, AlumnoDatosInput d, int rolAlumnoId)
    {
        var error = await ValidarIdentidad(identidad.ClaveAlumno, identidad.CorreoInstitucional);
        if (error != null) return new ResultadoAlta(false, error, null, null);
        error = await ValidarDatos(d);
        if (error != null) return new ResultadoAlta(false, error, null, null);

        var correo = identidad.CorreoInstitucional.Trim().ToLowerInvariant();
        var nombreCompleto = string.Join(' ',
            new[] { identidad.Nombre, identidad.ApellidoPaterno, identidad.ApellidoMaterno }
            .Where(s => !string.IsNullOrWhiteSpace(s))).Trim();

        // Si ya hay cuenta con ese correo, se reutiliza en vez de duplicarla; pero solo
        // si de verdad es la cuenta de un alumno activo. Si pertenece a un profesor o a
        // un coordinador, enlazarla le daría al alumno los permisos de esa persona.
        var existente = await db.usuarios.Include(u => u.id_rol_usuarioNavigation)
            .SingleOrDefaultAsync(u => u.correo == correo);
        usuario cuenta;
        string? passwordInicial = null;
        string? aviso = null;

        if (existente != null)
        {
            if (existente.activo != true || existente.id_rol_usuario != rolAlumnoId)
                return new ResultadoAlta(false, "Ese correo ya pertenece a otra cuenta.", null, null);
            cuenta = existente;
            aviso = "Se reutilizó la cuenta existente; no se generó contraseña nueva.";
        }
        else
        {
            passwordInicial = Seguridad.PasswordInicial();
            cuenta = new usuario {
                correo = correo,
                nombre = nombreCompleto,
                clave_institucional = identidad.ClaveAlumno.ToString(),
                id_rol_usuario = rolAlumnoId,
                activo = true,
                intentos_fallidos = 0,
                requiere_cambio = true,          // obliga a cambiarla al primer acceso
                fecha_creacion = DateTime.UtcNow
            };
            cuenta.contrasena_hash = new PasswordHasher<usuario>().HashPassword(cuenta, passwordInicial);
            db.usuarios.Add(cuenta);
        }

        var nuevo = new alumno {
            clave_alumno = identidad.ClaveAlumno,   // asignada por la universidad, no generada
            nombre = identidad.Nombre.Trim(),
            apellido_paterno = identidad.ApellidoPaterno.Trim(),
            apellido_materno = identidad.ApellidoMaterno?.Trim(),
            correo_institucional = correo,
            correo_personal = d.CorreoPersonal.Trim().ToLowerInvariant(),
            telefono = d.Telefono.Trim(),
            fecha_ingreso = d.FechaIngreso.Date,
            activo = d.Activo,
            id_programa = d.ProgramaId,
            id_generacion = d.GeneracionId,
            id_modalidad = d.ModalidadId,
            id_estado_academico = d.EstadoAcademicoId,
            id_usuarioNavigation = cuenta          // EF ordena los inserts y rellena la FK
        };
        db.alumnos.Add(nuevo);

        db.alumno_detalles.Add(new alumno_detalle {
            clave_alumnoNavigation = nuevo,
            id_periodo = d.PeriodoId,
            semestre = d.Semestre,
            fecha_registro = DateTime.UtcNow.Date
        });

        await db.SaveChangesAsync();
        return new ResultadoAlta(true, aviso, cuenta.id_usuario, passwordInicial);
    }

    /// <summary>Id del rol Alumno, o null si el catálogo no se ha sembrado.</summary>
    private async Task<int?> RolAlumno()
    {
        var id = await db.CAT_rol_usuarios
            .Where(r => r.nombre == Roles.Alumno && r.activo == true)
            .Select(r => (int?)r.id_rol_usuario).SingleOrDefaultAsync();
        return id;
    }

    // -----------------------------------------------------------------
    // Búsqueda en la base de la universidad
    // -----------------------------------------------------------------

    /// <summary>
    /// Consulta las claves en la base de la universidad. Es POST, no GET, porque el
    /// cuerpo es una lista de longitud variable; NO muta nada.
    /// </summary>
    [HttpPost("busqueda-externa")]
    public async Task<IActionResult> BusquedaExterna(BusquedaExternaInput input, CancellationToken ct)
    {
        if (!universidad.Configurado)
            return StatusCode(503, new { mensaje = "La conexión con la base de la universidad no está configurada. Contacta al administrador." });

        var pedidas = input.Claves.Distinct().ToArray();
        var formatoInvalido = pedidas.Where(c => c is < UniversidadExterna.ClaveMinima or > UniversidadExterna.ClaveMaxima).ToArray();

        List<AlumnoExterno> externos;
        try { externos = await universidad.Buscar(pedidas, ct); }
        catch (MySqlException) { return StatusCode(503, new { mensaje = "No fue posible consultar la base de la universidad." }); }

        // Dos consultas al total, no una por alumno: avisan al coordinador de que la
        // fila va a fallar ANTES de que rellene nueve campos.
        var claves = externos.Select(e => e.ClaveAlumno).ToArray();
        var correos = externos.Select(e => e.CorreoInstitucional.ToLowerInvariant()).ToArray();
        var yaImportados = await db.alumnos.Where(a => claves.Contains(a.clave_alumno))
            .Select(a => a.clave_alumno).ToListAsync(ct);
        var correosEnUso = await db.usuarios.Where(u => correos.Contains(u.correo))
            .Select(u => u.correo).ToListAsync(ct);

        var encontrados = externos.OrderBy(e => e.ClaveAlumno).Select(e => {
            // No se rechaza, solo se avisa, y quien decide es el coordinador. La
            // base de la universidad no dice a qué programa pertenece cada alumno,
            // así que GAS no puede comprobar que la clave sea del posgrado: eso lo
            // sabe quien la teclea.
            var motivo = e.Estatus == EstatusBaja
                ? "El registro está dado de baja en la universidad." : null;
            return new {
                claveAlumno = e.ClaveAlumno, nombre = e.Nombre,
                apellidoPaterno = e.ApellidoPaterno, apellidoMaterno = e.ApellidoMaterno,
                correoInstitucional = e.CorreoInstitucional,
                estatus = e.Estatus,
                elegible = motivo == null, motivo,
                yaImportado = yaImportados.Contains(e.ClaveAlumno),
                correoEnUso = correosEnUso.Contains(e.CorreoInstitucional.ToLowerInvariant())
            };
        }).ToList();

        return Ok(new {
            encontrados,
            noEncontrados = pedidas.Except(claves).Except(formatoInvalido).OrderBy(c => c).ToArray(),
            formatoInvalido,
            total = encontrados.Count
        });
    }

    // -----------------------------------------------------------------
    // Importación
    // -----------------------------------------------------------------

    /// <summary>
    /// Importa varios alumnos. Responde 200 incluso con fallos parciales: el detalle
    /// por fila viaja en el cuerpo, porque el cliente colapsa cualquier respuesta de
    /// error en un único mensaje y se perdería el desglose.
    /// </summary>
    [HttpPost("importacion")]
    public async Task<IActionResult> Importacion(ImportacionInput input, CancellationToken ct)
    {
        if (!universidad.Configurado)
            return StatusCode(503, new { mensaje = "La conexión con la base de la universidad no está configurada. Contacta al administrador." });

        var rolAlumnoId = await RolAlumno();
        if (rolAlumnoId == null)
            return StatusCode(503, new { mensaje = "El rol Alumno no está disponible en el catálogo." });

        // Una sola lectura de la base de la universidad para todo el lote, ANTES de
        // escribir nada: si está caída, se responde 503 sin efectos a medias.
        List<AlumnoExterno> externos;
        try { externos = await universidad.Buscar(input.Alumnos.Select(f => f.ClaveAlumno).ToArray(), ct); }
        catch (MySqlException) { return StatusCode(503, new { mensaje = "No fue posible consultar la base de la universidad." }); }
        var porClave = externos.ToDictionary(e => e.ClaveAlumno);

        var resultados = new List<object>(input.Alumnos.Length);
        var importados = 0;
        foreach (var fila in input.Alumnos)
        {
            if (!porClave.TryGetValue(fila.ClaveAlumno, out var identidad))
            {
                resultados.Add(new { claveAlumno = fila.ClaveAlumno, estado = "error", usuarioId = (int?)null,
                    correo = (string?)null, passwordInicial = (string?)null,
                    mensaje = "La clave no existe en la base de la universidad." });
                continue;
            }

            // Una transacción por alumno: una fila mala no debe tirar las buenas, y el
            // candado se suelta entre iteraciones para no bloquear la administración
            // de usuarios durante todo el lote.
            try
            {
                await using var tx = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.ReadCommitted, ct);
                await Candado();
                var r = await AltaAlumno(identidad, fila.Datos, rolAlumnoId.Value);
                if (!r.Ok)
                {
                    resultados.Add(new { claveAlumno = fila.ClaveAlumno, estado = "error", usuarioId = (int?)null,
                        correo = identidad.CorreoInstitucional, passwordInicial = (string?)null, mensaje = r.Mensaje });
                    continue;   // el `await using` deshace la transacción
                }
                await tx.CommitAsync(ct);
                importados++;
                resultados.Add(new { claveAlumno = fila.ClaveAlumno, estado = "importado", usuarioId = r.UsuarioId,
                    correo = identidad.CorreoInstitucional, passwordInicial = r.PasswordInicial, mensaje = r.Mensaje });
            }
            catch (DbUpdateException ex) when (ex.InnerException is MySqlException { Number: 1062 })
            {
                resultados.Add(new { claveAlumno = fila.ClaveAlumno, estado = "error", usuarioId = (int?)null,
                    correo = identidad.CorreoInstitucional, passwordInicial = (string?)null,
                    mensaje = "Otro proceso registró esa clave o ese correo al mismo tiempo. Vuelve a intentarlo." });
            }
            finally
            {
                // Imprescindible: el contexto es scoped y vive durante todo el bucle. Sin
                // esto, las entidades de una fila fallida siguen en estado Added y la
                // siguiente iteración intenta insertarlas otra vez, encadenando errores.
                db.ChangeTracker.Clear();
            }
        }

        return Ok(new { solicitados = input.Alumnos.Length, importados, fallidos = resultados.Count - importados, resultados });
    }

    // -----------------------------------------------------------------
    // Alta manual (opción secundaria) y consulta
    // -----------------------------------------------------------------

    [HttpPost]
    public async Task<IActionResult> Crear(AlumnoManualInput input)
    {
        var rolAlumnoId = await RolAlumno();
        if (rolAlumnoId == null)
            return StatusCode(503, new { mensaje = "El rol Alumno no está disponible en el catálogo." });

        var identidad = new AlumnoExterno(input.ClaveAlumno, input.Nombre, input.ApellidoPaterno,
            input.ApellidoMaterno, input.CorreoInstitucional, null);
        try
        {
            await using var tx = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.ReadCommitted);
            await Candado();
            var r = await AltaAlumno(identidad, input.Datos, rolAlumnoId.Value);
            if (!r.Ok) return Conflict(new { mensaje = r.Mensaje });
            await tx.CommitAsync();
            return Created($"/api/alumnos/{input.ClaveAlumno}", new {
                claveAlumno = input.ClaveAlumno, usuarioId = r.UsuarioId, passwordInicial = r.PasswordInicial,
                mensaje = r.Mensaje ?? "Alumno registrado. Deberá cambiar su contraseña inicial." });
        }
        catch (DbUpdateException ex) when (ex.InnerException is MySqlException { Number: 1062 })
        {
            return Conflict(new { mensaje = "Clave de alumno o correo duplicados." });
        }
    }

    /// <summary>
    /// Actualiza los datos de un alumno (RF-01.3) y su estado académico (RF-01.4).
    /// El cambio de estado se valida contra la máquina de estados del AMyD, así que
    /// un alumno titulado no puede volver a activo.
    /// </summary>
    [HttpPut("{clave:int}")]
    public async Task<IActionResult> Editar(int clave, AlumnoEdicionInput input)
    {
        await using var tx = await db.Database.BeginTransactionAsync(System.Data.IsolationLevel.ReadCommitted);
        await Candado();
        var a = (await db.alumnos.FromSqlInterpolated($"SELECT * FROM alumno WHERE clave_alumno = {clave} FOR UPDATE").ToListAsync()).SingleOrDefault();
        if (a == null) return NotFound();

        // RF-01.4: la transición manda sobre el valor. Comparar por nombre y no por
        // id mantiene la regla legible y atada al diagrama, no a los ids del seed.
        var estados = await db.CAT_estado_academicos
            .Where(e => e.id_estado_academico == a.id_estado_academico || e.id_estado_academico == input.EstadoAcademicoId)
            .ToDictionaryAsync(e => e.id_estado_academico, e => e.nombre);
        if (!estados.TryGetValue(input.EstadoAcademicoId, out var destino))
            return Conflict(new { mensaje = "Selecciona un estado académico válido." });
        if (a.id_estado_academico != null && estados.TryGetValue(a.id_estado_academico.Value, out var origen))
        {
            var error = EstadoAcademico.Validar(origen, destino);
            if (error != null) return Conflict(new { mensaje = error });
        }

        if (!await db.CAT_modalidad_titulacions.AnyAsync(m => m.id_modalidad == input.ModalidadId && m.activo == true))
            return Conflict(new { mensaje = "Selecciona una modalidad de titulación activa." });
        if (!await db.generacions.AnyAsync(g => g.id_generacion == input.GeneracionId && g.id_programa == a.id_programa))
            return Conflict(new { mensaje = "La generación seleccionada no pertenece al programa del alumno." });
        if (!await db.periodo_academicos.AnyAsync(p => p.id_periodo == input.PeriodoId))
            return Conflict(new { mensaje = "Selecciona un periodo académico válido." });

        var correo = input.CorreoInstitucional.Trim().ToLowerInvariant();
        // usuario.correo es UNIQUE: si cambia el institucional hay que mover también
        // la cuenta, o el alumno dejaría de poder entrar con su correo real.
        if (correo != a.correo_institucional)
        {
            if (await db.usuarios.AnyAsync(u => u.correo == correo && u.id_usuario != a.id_usuario))
                return Conflict(new { mensaje = "Ese correo institucional ya pertenece a otra cuenta." });
            if (a.id_usuario != null)
            {
                var cuenta = await db.usuarios.FindAsync(a.id_usuario.Value);
                if (cuenta != null) cuenta.correo = correo;
            }
        }

        a.correo_institucional = correo;
        a.correo_personal = input.CorreoPersonal.Trim().ToLowerInvariant();
        a.telefono = input.Telefono.Trim();
        a.id_estado_academico = input.EstadoAcademicoId;
        a.id_modalidad = input.ModalidadId;
        a.id_generacion = input.GeneracionId;
        a.activo = input.Activo;

        // El semestre es del periodo: se actualiza la inscripción si existe, o se crea.
        var detalle = await db.alumno_detalles.SingleOrDefaultAsync(d => d.clave_alumno == clave && d.id_periodo == input.PeriodoId);
        if (detalle == null)
            db.alumno_detalles.Add(new alumno_detalle { clave_alumno = clave, id_periodo = input.PeriodoId,
                semestre = input.Semestre, fecha_registro = DateTime.UtcNow.Date });
        else
            detalle.semestre = input.Semestre;

        try { await db.SaveChangesAsync(); await tx.CommitAsync(); }
        catch (DbUpdateException ex) when (ex.InnerException is MySqlException { Number: 1062 })
        { return Conflict(new { mensaje = "Ese correo institucional ya está en uso." }); }

        return Ok(new { mensaje = "Alumno actualizado." });
    }

    [HttpGet]
    // Criterios de RF-01.2. Los tres que faltan -estado del requisito TOEFL, estado
    // de tesis y porcentaje de avance- dependen de `requisito_toefl` y `tesis`, que
    // son RF-01.6 y RF-01.8: tablas vacías y trabajo de otro requerimiento.
    public async Task<IActionResult> Listar([FromQuery] string? buscar, [FromQuery] int? programaId,
        [FromQuery] int? generacionId, [FromQuery] int? estadoAcademicoId,
        [FromQuery] int? modalidadId, [FromQuery] int? semestre,
        [FromQuery] bool? activo, [FromQuery] int pagina = 1)
    {
        var q = db.alumnos.AsNoTracking()
            .Include(a => a.id_programaNavigation).Include(a => a.id_generacionNavigation)
            .Include(a => a.id_modalidadNavigation).Include(a => a.id_estado_academicoNavigation)
            .Include(a => a.alumno_detalles)
            .AsQueryable();
        if (!string.IsNullOrWhiteSpace(buscar))
        {
            var term = buscar.Trim();
            int.TryParse(term, out var clave);
            q = q.Where(a => a.clave_alumno == clave
                || (a.nombre != null && a.nombre.Contains(term))
                || (a.apellido_paterno != null && a.apellido_paterno.Contains(term))
                || (a.apellido_materno != null && a.apellido_materno.Contains(term))
                || (a.correo_institucional != null && a.correo_institucional.Contains(term)));
        }
        if (programaId != null) q = q.Where(a => a.id_programa == programaId);
        if (generacionId != null) q = q.Where(a => a.id_generacion == generacionId);
        if (estadoAcademicoId != null) q = q.Where(a => a.id_estado_academico == estadoAcademicoId);
        if (modalidadId != null) q = q.Where(a => a.id_modalidad == modalidadId);
        // El semestre vive en alumno_detalle, no en alumno: se filtra por su
        // inscripción más reciente, que es la que el coordinador tiene en mente.
        if (semestre != null)
            q = q.Where(a => a.alumno_detalles
                .OrderByDescending(d => d.id_periodo)
                .Select(d => d.semestre).FirstOrDefault() == semestre);
        if (activo != null) q = q.Where(a => a.activo == activo);
        pagina = Math.Clamp(pagina, 1, 1000000);
        var total = await q.CountAsync();
        var rows = await q.OrderBy(a => a.apellido_paterno).ThenBy(a => a.nombre)
            .Skip((pagina - 1) * 25).Take(25).ToListAsync();
        return Ok(new { total, pagina, tamano = 25, alumnos = rows.Select(Vista) });
    }

    [HttpGet("{clave:int}")]
    public async Task<IActionResult> Consultar(int clave)
    {
        var a = await db.alumnos.AsNoTracking()
            .Include(x => x.id_programaNavigation).Include(x => x.id_generacionNavigation)
            .Include(x => x.id_modalidadNavigation).Include(x => x.id_estado_academicoNavigation)
            .Include(x => x.alumno_detalles)
            .SingleOrDefaultAsync(x => x.clave_alumno == clave);
        return a == null ? NotFound() : Ok(Vista(a));
    }
}
