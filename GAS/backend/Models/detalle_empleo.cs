using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class detalle_empleo
{
    public int id_detalle_empleo { get; set; }

    public int id_empleo { get; set; }

    public string? puesto { get; set; }

    public DateTime? fecha_inicio { get; set; }

    public DateTime? fecha_final { get; set; }

    public decimal? sueldo { get; set; }

    public bool? relacion_posgrado { get; set; }

    public virtual empleo id_empleoNavigation { get; set; } = null!;
}
