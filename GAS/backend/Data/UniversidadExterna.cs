using MySql.Data.MySqlClient;

namespace backend.Data;

/// <summary>
/// Un alumno tal como lo conoce la base de datos de la universidad.
/// Los cinco primeros campos son los que GAS copia al importar; `Estatus` solo
/// sirve para avisar de si el registro sigue vigente, y no se guarda. El programa
/// académico NO viene de aquí: lo asigna el coordinador desde nuestro catálogo.
/// </summary>
public record AlumnoExterno(
    int ClaveAlumno,
    string Nombre,
    string ApellidoPaterno,
    string? ApellidoMaterno,
    string CorreoInstitucional,
    string? Estatus);

/// <summary>
/// Lectura de la base de datos de la universidad ("base B"), de donde se
/// importan los alumnos. SOLO LECTURA: esta clase no expone ninguna operación
/// de escritura, y el usuario MySQL que usa tiene únicamente permiso SELECT
/// sobre una tabla.
///
/// Es una dependencia OPCIONAL, igual que <see cref="Auth.CorreoRecuperacion"/>:
/// si el administrador no ha configurado la cadena de conexión, el resto de GAS
/// funciona con normalidad y los endpoints de importación responden 503. Por eso
/// se usa MySqlConnection directo en vez de un DbContext registrado con
/// AddDbContext, que exigiría la cadena al arrancar la aplicación.
///
/// Configuración (user-secrets, nunca appsettings.json):
///   dotnet user-secrets set "ConnectionStrings:UniversidadDb" \
///     "Server=localhost;Database=TEMPORAL;User=gas_lectura;Password=...;"
/// </summary>
public class UniversidadExterna(IConfiguration config)
{
    /// <summary>Tope de claves por consulta. Se impone en el servidor, no en la interfaz.</summary>
    public const int MaxClaves = 50;

    /// <summary>La clave de alumno de la universidad es un número de 6 cifras.</summary>
    public const int ClaveMinima = 100_000, ClaveMaxima = 999_999;

    // Lista de columnas explícita a propósito: la tabla de la universidad tiene
    // más campos de los que necesitamos (CURP, fecha de nacimiento, facultad...).
    // Un SELECT * nos ataría a su esquema y traería datos personales que GAS no
    // almacena.
    private const string Consulta = """
        SELECT clave_alumno, nombre, apellido_paterno, apellido_materno,
               correo_institucional, estatus
        FROM estudiante
        WHERE clave_alumno IN
        """;

    private string? Cadena => config.GetConnectionString("UniversidadDb");

    /// <summary>¿El administrador configuró la conexión con la universidad?</summary>
    public bool Configurado => !string.IsNullOrWhiteSpace(Cadena);

    /// <summary>¿Responde la base de la universidad? Para el endpoint de salud.</summary>
    public async Task<bool> Disponible(CancellationToken ct = default)
    {
        if (!Configurado) return false;
        try
        {
            await using var conexion = new MySqlConnection(Cadena);
            await conexion.OpenAsync(ct);
            await using var cmd = new MySqlCommand("SELECT 1", conexion) { CommandTimeout = 10 };
            await cmd.ExecuteScalarAsync(ct);
            return true;
        }
        catch (MySqlException) { return false; }
    }

    /// <summary>
    /// Busca las claves indicadas y devuelve <b>solo las que existen</b>. Quien
    /// llama calcula las ausentes por diferencia de conjuntos; así se distingue
    /// "no existe en la universidad" de un fallo de conexión, que lanza.
    /// </summary>
    /// <exception cref="MySqlException">La base de la universidad no responde.</exception>
    public async Task<List<AlumnoExterno>> Buscar(IReadOnlyCollection<int> claves, CancellationToken ct = default)
    {
        // Se descartan claves fuera del formato de 6 cifras antes de tocar la red.
        var validas = claves.Where(c => c is >= ClaveMinima and <= ClaveMaxima).Distinct().Take(MaxClaves).ToArray();
        if (!Configurado || validas.Length == 0) return [];

        await using var conexion = new MySqlConnection(Cadena);
        await conexion.OpenAsync(ct);

        // Un parámetro nombrado por clave. Nunca se interpolan valores en el SQL,
        // aunque aquí ya sean enteros validados.
        var marcadores = string.Join(", ", validas.Select((_, i) => "@c" + i));
        await using var cmd = new MySqlCommand($"{Consulta} ({marcadores})", conexion) { CommandTimeout = 10 };
        for (var i = 0; i < validas.Length; i++) cmd.Parameters.AddWithValue("@c" + i, validas[i]);

        var encontrados = new List<AlumnoExterno>(validas.Length);
        await using var lector = await cmd.ExecuteReaderAsync(ct);
        while (await lector.ReadAsync(ct))
            encontrados.Add(new AlumnoExterno(
                lector.GetInt32(0),
                lector.GetString(1),
                lector.GetString(2),
                lector.IsDBNull(3) ? null : lector.GetString(3),
                lector.GetString(4),
                lector.IsDBNull(5) ? null : lector.GetString(5)));
        return encontrados;
    }
}
