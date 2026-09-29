namespace backend.Models;
public partial class usuario
{
    public string? clave_institucional { get; set; }
    public string? nombre { get; set; }
}
public class SesionUsuario
{
    public string Id { get; set; } = null!;
    public int UsuarioId { get; set; }
    public DateTime UltimaActividad { get; set; }
    public DateTime Creada { get; set; }
}
