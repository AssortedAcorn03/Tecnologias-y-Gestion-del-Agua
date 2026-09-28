using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class encuestum
{
    public int id_encuesta { get; set; }

    public string? nombre { get; set; }

    public string? tipo { get; set; }

    public DateTime? fecha_creacion { get; set; }

    public bool? activa { get; set; }

    public virtual ICollection<respuesta_encuestum> respuesta_encuesta { get; set; } = new List<respuesta_encuestum>();

    public virtual ICollection<seccion_encuestum> seccion_encuesta { get; set; } = new List<seccion_encuestum>();
}
