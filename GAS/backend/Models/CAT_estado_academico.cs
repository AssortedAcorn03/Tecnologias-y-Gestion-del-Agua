using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class CAT_estado_academico
{
    public int id_estado_academico { get; set; }

    public string nombre { get; set; } = null!;

    public string? descripcion { get; set; }

    public virtual ICollection<alumno> alumnos { get; set; } = new List<alumno>();
}
