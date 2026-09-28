using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class log_acceso
{
    public int id_log { get; set; }

    public int? id_usuario { get; set; }

    public DateTime? fecha { get; set; }

    public string? resultado { get; set; }

    public string? ip { get; set; }

    public virtual usuario? id_usuarioNavigation { get; set; }
}
