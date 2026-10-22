namespace backend.Models;

// Columnas añadidas a mano por database/tesis.sql y tesis_solicitud.sql, fuera del
// scaffolding. Viven aquí para que `dotnet ef dbcontext scaffold` no las borre al
// regenerar Models/tesi.cs y Models/revision.cs.
//
// El nombre de la entidad es `tesi` porque el pluralizador de EF no entiende
// español y singularizó «tesis» como si fuera latín. Se conserva para no romper
// el contexto generado.

public partial class tesi
{
    /// <summary>Resumen que captura el tesista al registrar su tesis (RF-01.10.1).</summary>
    public string? resumen { get; set; }

    /// <summary>Último cambio en título, resumen, estado o porcentaje (RF-01.10.3).</summary>
    public DateTime? ultima_actualizacion { get; set; }

    // --- Circuito de solicitud y aprobación ---
    // El diagrama del AMyD describe el alta en dos tiempos: el tesista presenta una
    // solicitud con un director propuesto, y la tesis no es oficial hasta que ese
    // director la acepta.

    /// <summary>Línea de investigación declarada por el tesista.</summary>
    public string? linea_investigacion { get; set; }

    /// <summary>
    /// Modalidad con la que se aprobó la tesis. Distinta de `alumno.id_modalidad`,
    /// que es la intención registrada al ingresar y que el coordinador puede
    /// cambiar después: ésta queda fijada por la solicitud que el director aprobó.
    /// </summary>
    public int? id_modalidad { get; set; }

    /// <summary>Pendiente · Aceptada · Rechazada.</summary>
    public string estado_solicitud { get; set; } = EstadoSolicitudTesis.Pendiente;

    /// <summary>Director propuesto por el tesista; confirmado si acepta.</summary>
    public int? rpe_director { get; set; }

    public DateTime? fecha_solicitud { get; set; }
    public DateTime? fecha_resolucion { get; set; }

    /// <summary>Razón del rechazo, para que el tesista proponga otro director.</summary>
    public string? motivo_rechazo { get; set; }
}

/// <summary>
/// Los tres estados del circuito de aprobación del diagrama del AMyD.
/// Son constantes y no un catálogo porque el flujo del diagrama es cerrado:
/// una solicitud solo puede estar pendiente, aceptada o rechazada.
/// </summary>
public static class EstadoSolicitudTesis
{
    public const string Pendiente = "Pendiente";
    public const string Aceptada = "Aceptada";
    public const string Rechazada = "Rechazada";
}

public partial class revision
{
    /// <summary>
    /// Criterios de evaluación aplicados en la revisión (RF-01.10.4). Son distintos
    /// de `comentarios`: los criterios son la rúbrica, los comentarios el juicio.
    /// </summary>
    public string? criterios { get; set; }
}
