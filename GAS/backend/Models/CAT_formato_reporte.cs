using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class CAT_formato_reporte
{
    public int id_formato_reporte { get; set; }

    public string nombre { get; set; } = null!;

    public virtual ICollection<reporte> reportes { get; set; } = new List<reporte>();
}
