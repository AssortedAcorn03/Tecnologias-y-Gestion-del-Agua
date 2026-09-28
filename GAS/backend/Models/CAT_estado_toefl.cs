using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class CAT_estado_toefl
{
    public int id_estado_toefl { get; set; }

    public string nombre { get; set; } = null!;

    public string? descripcion { get; set; }

    public virtual ICollection<requisito_toefl> requisito_toefls { get; set; } = new List<requisito_toefl>();
}
