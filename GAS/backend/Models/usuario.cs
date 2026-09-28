using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class usuario
{
    public int id_usuario { get; set; }

    public string correo { get; set; } = null!;

    public string contrasena_hash { get; set; } = null!;

    public int? id_rol_usuario { get; set; }

    public bool? activo { get; set; }

    public int? intentos_fallidos { get; set; }

    public DateTime? bloqueado_hasta { get; set; }

    public bool? requiere_cambio { get; set; }

    public DateTime? fecha_creacion { get; set; }

    public DateTime? ultimo_acceso { get; set; }

    public virtual ICollection<alumno> alumnos { get; set; } = new List<alumno>();

    public virtual CAT_rol_usuario? id_rol_usuarioNavigation { get; set; }

    public virtual ICollection<log_acceso> log_accesos { get; set; } = new List<log_acceso>();

    public virtual ICollection<profesor_detalle> profesor_detalles { get; set; } = new List<profesor_detalle>();

    public virtual ICollection<reporte> reportes { get; set; } = new List<reporte>();

    public virtual ICollection<token_recuperacion> token_recuperacions { get; set; } = new List<token_recuperacion>();
}
