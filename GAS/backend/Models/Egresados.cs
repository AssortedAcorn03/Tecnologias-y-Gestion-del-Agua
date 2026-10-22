namespace backend.Models;

// Columnas añadidas a mano por database/egresados.sql, fuera del scaffolding.
// Viven aquí y no en los archivos generados para que `dotnet ef dbcontext
// scaffold` no las borre al regenerar Models/egresado.cs y detalle_empleo.cs.

public partial class egresado
{
    /// <summary>Medios de contacto adicionales (RF-02.3): teléfono alterno, red social, etc.</summary>
    public string? otros_contactos { get; set; }
}

public partial class detalle_empleo
{
    /// <summary>Descripción de las funciones del puesto (RF-02.4).</summary>
    public string? actividades { get; set; }
}
