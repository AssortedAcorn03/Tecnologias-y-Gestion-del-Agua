using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class CAT_tipo_reporte
{
    public int id_tipo_reporte { get; set; }

    public string nombre { get; set; } = null!;

    public string? descripcion { get; set; }

    public virtual ICollection<reporte> reportes { get; set; } = new List<reporte>();
}
