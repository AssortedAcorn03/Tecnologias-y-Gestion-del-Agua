using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class empleo
{
    public int id_empleo { get; set; }

    public int clave_alumno { get; set; }

    public int? id_empresa { get; set; }

    public string? tipo { get; set; }

    public int? id_situacion_laboral { get; set; }

    public string? area_profesional { get; set; }

    public bool? trabajo_actual { get; set; }

    public virtual egresado clave_alumnoNavigation { get; set; } = null!;

    public virtual ICollection<detalle_empleo> detalle_empleos { get; set; } = new List<detalle_empleo>();

    public virtual empresa? id_empresaNavigation { get; set; }

    public virtual CAT_situacion_laboral? id_situacion_laboralNavigation { get; set; }
}
