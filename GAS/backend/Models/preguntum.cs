using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class preguntum
{
    public int id_pregunta { get; set; }

    public int id_seccion { get; set; }

    public int? id_tipo_pregunta { get; set; }

    public string? texto { get; set; }

    public bool? obligatoria { get; set; }

    public int? orden { get; set; }

    public virtual seccion_encuestum id_seccionNavigation { get; set; } = null!;

    public virtual CAT_tipo_preguntum? id_tipo_preguntaNavigation { get; set; }

    public virtual ICollection<opcion_preguntum> opcion_pregunta { get; set; } = new List<opcion_preguntum>();

    public virtual ICollection<respuestum> respuesta { get; set; } = new List<respuestum>();
}
