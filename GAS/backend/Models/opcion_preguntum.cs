using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class opcion_preguntum
{
    public int id_opcion { get; set; }

    public int id_pregunta { get; set; }

    public string? texto { get; set; }

    public int? valor { get; set; }

    public int? orden { get; set; }

    public virtual preguntum id_preguntaNavigation { get; set; } = null!;

    public virtual ICollection<respuestum> respuesta { get; set; } = new List<respuestum>();
}
