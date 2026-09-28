using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class intento_contacto
{
    public int id_intento { get; set; }

    public int clave_alumno { get; set; }

    public DateTime? fecha_intento { get; set; }

    public string? observaciones { get; set; }

    public virtual egresado clave_alumnoNavigation { get; set; } = null!;
}
