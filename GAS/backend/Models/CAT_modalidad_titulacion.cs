using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class CAT_modalidad_titulacion
{
    public int id_modalidad { get; set; }

    public string nombre { get; set; } = null!;

    public string? descripcion { get; set; }

    public bool? activo { get; set; }

    public virtual ICollection<alumno> alumnos { get; set; } = new List<alumno>();
}
