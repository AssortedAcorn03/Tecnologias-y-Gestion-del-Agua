using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class empresa
{
    public int id_empresa { get; set; }

    public string? nombre { get; set; }

    public string? sector { get; set; }

    public string? pais { get; set; }

    public string? estado { get; set; }

    public string? ciudad { get; set; }

    public virtual ICollection<empleo> empleos { get; set; } = new List<empleo>();
}
