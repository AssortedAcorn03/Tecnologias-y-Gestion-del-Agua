using System;

namespace backend.Models;

public partial class historial_comite
{
    public int id_historial { get; set; }

    public int id_comite { get; set; }

    public int? id_usuario { get; set; }

    public string accion { get; set; } = null!;

    public int? rpe_anterior { get; set; }

    public int? rpe_nuevo { get; set; }

    public int? id_rol_anterior { get; set; }

    public int? id_rol_nuevo { get; set; }

    public DateTime fecha_cambio { get; set; }

    public string? observaciones { get; set; }

    public virtual comite id_comiteNavigation { get; set; } = null!;

    public virtual usuario? id_usuarioNavigation { get; set; }
}
