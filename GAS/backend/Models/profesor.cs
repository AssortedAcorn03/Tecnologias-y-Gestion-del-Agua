using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class profesor
{
    public int rpe { get; set; }

    public string? nombre { get; set; }

    public string? apellido_paterno { get; set; }

    public string? apellido_materno { get; set; }

    public virtual ICollection<comite_profesor> comite_profesors { get; set; } = new List<comite_profesor>();

    public virtual ICollection<profesor_detalle> profesor_detalles { get; set; } = new List<profesor_detalle>();

    public virtual ICollection<revision_profesor> revision_profesors { get; set; } = new List<revision_profesor>();
}
