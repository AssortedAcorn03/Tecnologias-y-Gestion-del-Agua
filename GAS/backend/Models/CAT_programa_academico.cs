using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class CAT_programa_academico
{
    public int id_programa { get; set; }

    public string nombre { get; set; } = null!;

    public string? descripcion { get; set; }

    public bool? activo { get; set; }

    public virtual ICollection<alumno> alumnos { get; set; } = new List<alumno>();

    public virtual ICollection<generacion> generacions { get; set; } = new List<generacion>();

    public virtual ICollection<tesi> tesis { get; set; } = new List<tesi>();
}
