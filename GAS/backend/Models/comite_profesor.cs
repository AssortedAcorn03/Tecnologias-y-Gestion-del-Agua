using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class comite_profesor
{
    public int id_comite_profesor { get; set; }

    public int id_comite { get; set; }

    public int rpe { get; set; }

    public int id_rol_comite { get; set; }

    public DateTime? fecha_asignacion { get; set; }

    public bool? activo { get; set; }

    public virtual comite id_comiteNavigation { get; set; } = null!;

    public virtual CAT_rol_comite id_rol_comiteNavigation { get; set; } = null!;

    public virtual profesor rpeNavigation { get; set; } = null!;
}
