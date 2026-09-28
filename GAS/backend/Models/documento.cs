using System;
using System.Collections.Generic;

namespace backend.Models;

public partial class documento
{
    public int id_documento { get; set; }

    public int? clave_alumno { get; set; }

    public int? id_tesis { get; set; }

    public int? id_revision { get; set; }

    public string? cve_acta { get; set; }

    public int? id_tipo_documento { get; set; }

    public string? nombre_archivo { get; set; }

    public string? ruta_archivo { get; set; }

    public DateTime? fecha_carga { get; set; }

    public virtual alumno? clave_alumnoNavigation { get; set; }

    public virtual acta_comite? cve_actaNavigation { get; set; }

    public virtual revision? id_revisionNavigation { get; set; }

    public virtual tesi? id_tesisNavigation { get; set; }

    public virtual CAT_tipo_documento? id_tipo_documentoNavigation { get; set; }
}
