using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class CAT_situacion_laboral
{
    public int id_situacion_laboral { get; set; }

    public string nombre { get; set; } = null!;

    public string? descripcion { get; set; }

    public virtual ICollection<empleo> empleos { get; set; } = new List<empleo>();
}
