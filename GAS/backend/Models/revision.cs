using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class revision
{
    public int id_revision { get; set; }

    public DateTime? fecha { get; set; }

    public int id_tesis { get; set; }

    public int? id_periodo { get; set; }

    public string? comentarios { get; set; }

    public decimal? porcentaje_avance { get; set; }

    public string? estado { get; set; }

    public virtual ICollection<acta_comite> acta_comites { get; set; } = new List<acta_comite>();

    public virtual ICollection<acuerdo_evaluacion> acuerdo_evaluacions { get; set; } = new List<acuerdo_evaluacion>();

    public virtual ICollection<documento> documentos { get; set; } = new List<documento>();

    public virtual periodo_academico? id_periodoNavigation { get; set; }

    public virtual tesi id_tesisNavigation { get; set; } = null!;

    public virtual ICollection<revision_profesor> revision_profesors { get; set; } = new List<revision_profesor>();
}
