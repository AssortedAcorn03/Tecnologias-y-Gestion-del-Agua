using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class CAT_rol_comite
{
    public int id_rol_comite { get; set; }

    public string nombre { get; set; } = null!;

    public string? descripcion { get; set; }

    public virtual ICollection<comite_profesor> comite_profesors { get; set; } = new List<comite_profesor>();
}
