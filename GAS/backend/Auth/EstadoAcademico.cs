namespace backend.Auth;

/// <summary>
/// Máquina de estados del estado académico del alumno (RF-01.4).
///
/// Las transiciones vienen del diagrama de estados del AMyD, no de su texto: el
/// texto lista solo tres estados (Activo, Titulado, Baja), pero el diagrama
/// distingue la baja temporal de la definitiva, que es justo lo que da sentido a
/// las transiciones. Donde se contradicen, manda el diagrama.
///
///              ┌── cumple requisitos ──► Titulado ──► (fin)
///              │
///   ●─► Activo ─── baja definitiva ────► BajaDefinitiva ──► (fin)
///          │ ▲
///          │ └── reingreso ──┐
///          └── baja temporal ─► BajaTemporal ── baja definitiva ──► BajaDefinitiva
///
/// Los nombres deben coincidir EXACTAMENTE con CAT_estado_academico.nombre, tal
/// como lo carga database/seed.sql.
/// </summary>
public static class EstadoAcademico
{
    public const string Activo = "Activo";
    public const string Titulado = "Titulado";
    public const string BajaDefinitiva = "Baja definitiva";
    public const string BajaTemporal = "Baja temporal";

    // Un estado ausente de este mapa es terminal: no admite ninguna salida.
    private static readonly Dictionary<string, string[]> Permitidas = new()
    {
        [Activo] = [Titulado, BajaTemporal, BajaDefinitiva],
        [BajaTemporal] = [Activo, BajaDefinitiva]
    };

    /// <summary>¿Se puede pasar de un estado a otro? Quedarse igual siempre vale.</summary>
    public static bool Permite(string desde, string hacia) =>
        desde == hacia || (Permitidas.TryGetValue(desde, out var destinos) && destinos.Contains(hacia));

    /// <summary>null si la transición es válida; si no, el motivo para el coordinador.</summary>
    public static string? Validar(string desde, string hacia)
    {
        if (Permite(desde, hacia)) return null;
        return Permitidas.ContainsKey(desde)
            ? $"No se puede pasar de «{desde}» a «{hacia}». Desde «{desde}» solo se permite: {string.Join(", ", Permitidas[desde])}."
            : $"«{desde}» es un estado final: el alumno ya no puede cambiar de estado académico.";
    }
}
