using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class CAT_rol_usuario
{
    public int id_rol_usuario { get; set; }

    public string nombre { get; set; } = null!;

    public string? descripcion { get; set; }

    public bool? activo { get; set; }

    public virtual ICollection<usuario> usuarios { get; set; } = new List<usuario>();
}
