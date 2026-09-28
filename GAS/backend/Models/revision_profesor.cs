using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class revision_profesor
{
    public int id_revision_profesor { get; set; }

    public int rpe { get; set; }

    public int id_revision { get; set; }

    public string? comentarios { get; set; }

    public virtual revision id_revisionNavigation { get; set; } = null!;

    public virtual profesor rpeNavigation { get; set; } = null!;
}
