using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class acuerdo_evaluacion
{
    public int id_acuerdo { get; set; }

    public int id_revision { get; set; }

    public string? descripcion { get; set; }

    public DateTime? fecha_compromiso { get; set; }

    public bool? cumplido { get; set; }

    public virtual revision id_revisionNavigation { get; set; } = null!;
}
