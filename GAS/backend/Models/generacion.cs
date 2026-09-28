using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class generacion
{
    public int id_generacion { get; set; }

    public int id_programa { get; set; }

    public int? anio_ingreso { get; set; }

    public int? anio_egreso_estimado { get; set; }

    public string? nombre_generacion { get; set; }

    public virtual ICollection<alumno> alumnos { get; set; } = new List<alumno>();

    public virtual CAT_programa_academico id_programaNavigation { get; set; } = null!;
}
