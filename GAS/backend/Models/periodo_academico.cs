using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class periodo_academico
{
    public int id_periodo { get; set; }

    public string? nombre { get; set; }

    public DateTime? fecha_inicio { get; set; }

    public DateTime? fecha_fin { get; set; }

    public string? tipo_periodo { get; set; }

    public virtual ICollection<alumno_detalle> alumno_detalles { get; set; } = new List<alumno_detalle>();

    public virtual ICollection<revision> revisions { get; set; } = new List<revision>();
}
