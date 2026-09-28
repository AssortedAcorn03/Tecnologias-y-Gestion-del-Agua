using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class requisito_toefl
{
    public int id_toefl { get; set; }

    public int clave_alumno { get; set; }

    public int? id_estado_toefl { get; set; }

    public DateTime? fecha_presentacion { get; set; }

    public decimal? puntaje { get; set; }

    public string? observaciones { get; set; }

    public virtual ICollection<acta_comite> acta_comites { get; set; } = new List<acta_comite>();

    public virtual alumno clave_alumnoNavigation { get; set; } = null!;

    public virtual CAT_estado_toefl? id_estado_toeflNavigation { get; set; }
}
