using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace backend.Models;
[Table("tesis_seguimiento")]
public class tesis_seguimiento {
 [Key] public int id_tesis { get; set; }
 [MaxLength(1000)] public string resumen { get; set; } = "";
 [MaxLength(30)] public string? resolucion { get; set; }
 public string? dictamen { get; set; }
 public DateTime? fecha_resolucion { get; set; }
 public int? usuario_resolucion { get; set; }
}
