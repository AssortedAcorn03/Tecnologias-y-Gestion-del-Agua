using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class comite
{
    public int id_comite { get; set; }

    public int id_tesis { get; set; }

    public string? tipo { get; set; }

    public virtual ICollection<acta_comite> acta_comites { get; set; } = new List<acta_comite>();

    public virtual ICollection<comite_profesor> comite_profesors { get; set; } = new List<comite_profesor>();

    public virtual tesi id_tesisNavigation { get; set; } = null!;
}
