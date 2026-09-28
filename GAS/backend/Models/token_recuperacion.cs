using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class token_recuperacion
{
    public int id_token { get; set; }

    public int id_usuario { get; set; }

    public string token { get; set; } = null!;

    public DateTime fecha_expiracion { get; set; }

    public bool? usado { get; set; }

    public virtual usuario id_usuarioNavigation { get; set; } = null!;
}
