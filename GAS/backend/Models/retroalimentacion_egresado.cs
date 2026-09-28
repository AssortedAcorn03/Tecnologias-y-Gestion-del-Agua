using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class retroalimentacion_egresado
{
    public int id_retroalimentacion { get; set; }

    public int clave_alumno { get; set; }

    public DateTime? fecha { get; set; }

    public string? comentario { get; set; }

    public string? sugerencia { get; set; }

    public virtual egresado clave_alumnoNavigation { get; set; } = null!;
}
