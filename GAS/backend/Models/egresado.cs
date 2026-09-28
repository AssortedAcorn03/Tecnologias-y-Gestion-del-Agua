using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class egresado
{
    public int clave_alumno { get; set; }

    public int? id_egresado { get; set; }

    public DateTime? fecha_egreso { get; set; }

    public int? id_estado_egresado { get; set; }

    public string? identificador_egresado { get; set; }

    public string? correo { get; set; }

    public string? telefono { get; set; }

    public string? ciudad { get; set; }

    public DateTime? ultima_actualizacion { get; set; }

    public bool? localizable { get; set; }

    public virtual alumno clave_alumnoNavigation { get; set; } = null!;

    public virtual ICollection<empleo> empleos { get; set; } = new List<empleo>();

    public virtual CAT_estado_egresado? id_estado_egresadoNavigation { get; set; }

    public virtual ICollection<intento_contacto> intento_contactos { get; set; } = new List<intento_contacto>();

    public virtual ICollection<respuesta_encuestum> respuesta_encuesta { get; set; } = new List<respuesta_encuestum>();

    public virtual ICollection<retroalimentacion_egresado> retroalimentacion_egresados { get; set; } = new List<retroalimentacion_egresado>();
}
