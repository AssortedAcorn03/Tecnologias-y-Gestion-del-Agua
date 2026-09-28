using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class CAT_tipo_preguntum
{
    public int id_tipo_pregunta { get; set; }

    public string nombre { get; set; } = null!;

    public string? descripcion { get; set; }

    public virtual ICollection<preguntum> pregunta { get; set; } = new List<preguntum>();
}
