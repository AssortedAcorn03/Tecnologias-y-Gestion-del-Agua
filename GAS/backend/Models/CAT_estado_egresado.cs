using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class CAT_estado_egresado
{
    public int id_estado_egresado { get; set; }

    public string nombre { get; set; } = null!;

    public string? descripcion { get; set; }

    public virtual ICollection<egresado> egresados { get; set; } = new List<egresado>();
}
