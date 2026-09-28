using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class tesi
{
    public int id_tesis { get; set; }

    public string? titulo { get; set; }

    public int clave_alumno { get; set; }

    public int? id_programa { get; set; }

    public decimal? porcentaje_actual { get; set; }

    public int? id_estado_tesis { get; set; }

    public DateTime? fecha_registro { get; set; }

    public virtual alumno clave_alumnoNavigation { get; set; } = null!;

    public virtual ICollection<comite> comites { get; set; } = new List<comite>();

    public virtual ICollection<documento> documentos { get; set; } = new List<documento>();

    public virtual CAT_estado_tesi? id_estado_tesisNavigation { get; set; }

    public virtual CAT_programa_academico? id_programaNavigation { get; set; }

    public virtual ICollection<revision> revisions { get; set; } = new List<revision>();
}
