using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class CAT_estado_tesi
{
    public int id_estado_tesis { get; set; }

    public string nombre { get; set; } = null!;

    public string? descripcion { get; set; }

    public virtual ICollection<tesi> tesis { get; set; } = new List<tesi>();
}
