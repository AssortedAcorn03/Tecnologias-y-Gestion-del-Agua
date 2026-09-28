using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class profesor_detalle
{
    public int id_profesor_detalle { get; set; }

    public int rpe { get; set; }

    public int? id_usuario { get; set; }

    public string? correo_institucional { get; set; }

    public bool? activo { get; set; }

    public virtual usuario? id_usuarioNavigation { get; set; }

    public virtual profesor rpeNavigation { get; set; } = null!;
}
