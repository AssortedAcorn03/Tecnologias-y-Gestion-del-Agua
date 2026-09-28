using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class alumno_detalle
{
    public int id_alumno_detalle { get; set; }

    public int clave_alumno { get; set; }

    public int id_periodo { get; set; }

    public int? semestre { get; set; }

    public DateTime? fecha_registro { get; set; }

    public virtual alumno clave_alumnoNavigation { get; set; } = null!;

    public virtual periodo_academico id_periodoNavigation { get; set; } = null!;
}
