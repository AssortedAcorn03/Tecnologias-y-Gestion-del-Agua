using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class respuesta_encuestum
{
    public int id_respuesta_encuesta { get; set; }

    public int id_encuesta { get; set; }

    public int clave_alumno { get; set; }

    public DateTime? fecha_inicio { get; set; }

    public DateTime? fecha_envio { get; set; }

    public bool? completada { get; set; }

    public virtual egresado clave_alumnoNavigation { get; set; } = null!;

    public virtual encuestum id_encuestaNavigation { get; set; } = null!;

    public virtual ICollection<respuestum> respuesta { get; set; } = new List<respuestum>();
}
