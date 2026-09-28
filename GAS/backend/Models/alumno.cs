using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class alumno
{
    public int clave_alumno { get; set; }

    public string? nombre { get; set; }

    public string? apellido_paterno { get; set; }

    public string? apellido_materno { get; set; }

    public DateTime? fecha_ingreso { get; set; }

    public bool? activo { get; set; }

    public int? id_usuario { get; set; }

    public int? id_programa { get; set; }

    public int? id_generacion { get; set; }

    public string? correo_institucional { get; set; }

    public string? correo_personal { get; set; }

    public string? telefono { get; set; }

    public int? id_modalidad { get; set; }

    public int? id_estado_academico { get; set; }

    public virtual ICollection<acta_comite> acta_comites { get; set; } = new List<acta_comite>();

    public virtual ICollection<alumno_detalle> alumno_detalles { get; set; } = new List<alumno_detalle>();

    public virtual ICollection<documento> documentos { get; set; } = new List<documento>();

    public virtual egresado? egresado { get; set; }

    public virtual CAT_estado_academico? id_estado_academicoNavigation { get; set; }

    public virtual generacion? id_generacionNavigation { get; set; }

    public virtual CAT_modalidad_titulacion? id_modalidadNavigation { get; set; }

    public virtual CAT_programa_academico? id_programaNavigation { get; set; }

    public virtual usuario? id_usuarioNavigation { get; set; }

    public virtual ICollection<requisito_toefl> requisito_toefls { get; set; } = new List<requisito_toefl>();

    public virtual ICollection<tesi> tesis { get; set; } = new List<tesi>();
}
