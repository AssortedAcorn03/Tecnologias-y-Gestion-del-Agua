using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class respuestum
{
    public int id_respuesta { get; set; }

    public int id_respuesta_encuesta { get; set; }

    public int id_pregunta { get; set; }

    public int? id_opcion { get; set; }

    public string? respuesta { get; set; }

    public DateTime? fecha_respuesta { get; set; }

    public virtual opcion_preguntum? id_opcionNavigation { get; set; }

    public virtual preguntum id_preguntaNavigation { get; set; } = null!;

    public virtual respuesta_encuestum id_respuesta_encuestaNavigation { get; set; } = null!;
}
