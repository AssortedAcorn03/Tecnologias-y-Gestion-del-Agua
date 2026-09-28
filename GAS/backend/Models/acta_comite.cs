using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class acta_comite
{
    public string cve_acta { get; set; } = null!;

    public int clave_alumno { get; set; }

    public int id_comite { get; set; }

    public int? id_revision { get; set; }

    public int? id_toefl { get; set; }

    public int? num_evaluacion { get; set; }

    public DateTime? fecha_reunion { get; set; }

    public string? observaciones { get; set; }

    public string? resultado { get; set; }

    public string? archivo_acta { get; set; }

    public bool? estado { get; set; }

    public virtual alumno clave_alumnoNavigation { get; set; } = null!;

    public virtual ICollection<documento> documentos { get; set; } = new List<documento>();

    public virtual comite id_comiteNavigation { get; set; } = null!;

    public virtual revision? id_revisionNavigation { get; set; }

    public virtual requisito_toefl? id_toeflNavigation { get; set; }
}
