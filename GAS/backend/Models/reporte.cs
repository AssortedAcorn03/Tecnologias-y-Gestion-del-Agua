using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class reporte
{
    public int id_reporte { get; set; }

    public int? id_tipo_reporte { get; set; }

    public int? id_formato_reporte { get; set; }

    public int? id_usuario_genero { get; set; }

    public DateTime? fecha_generacion { get; set; }

    public string? filtros_usados { get; set; }

    public string? ruta_archivo { get; set; }

    public virtual CAT_formato_reporte? id_formato_reporteNavigation { get; set; }

    public virtual CAT_tipo_reporte? id_tipo_reporteNavigation { get; set; }

    public virtual usuario? id_usuario_generoNavigation { get; set; }
}
