using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class CAT_tipo_documento
{
    public int id_tipo_documento { get; set; }

    public string nombre { get; set; } = null!;

    public string? descripcion { get; set; }

    public virtual ICollection<documento> documentos { get; set; } = new List<documento>();
}
