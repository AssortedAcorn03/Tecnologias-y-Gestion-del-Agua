using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class seccion_encuestum
{
    public int id_seccion { get; set; }

    public int id_encuesta { get; set; }

    public string? nombre { get; set; }

    public int? orden { get; set; }

    public virtual encuestum id_encuestaNavigation { get; set; } = null!;

    public virtual ICollection<preguntum> pregunta { get; set; } = new List<preguntum>();
}
