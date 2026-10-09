using backend.Models;
using Microsoft.EntityFrameworkCore;
namespace backend.Data;
public partial class GasDbContext
{
    public DbSet<SesionUsuario> Sesiones => Set<SesionUsuario>();
    partial void OnModelCreatingPartial(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<usuario>().Property(x => x.clave_institucional).HasMaxLength(30);
        modelBuilder.Entity<usuario>().Property(x => x.nombre).HasMaxLength(150);
        modelBuilder.Entity<usuario>().HasIndex(x => x.clave_institucional).IsUnique();
        modelBuilder.Entity<SesionUsuario>(e => {
            e.ToTable("sesion_usuario"); e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(64);
            e.HasOne<usuario>().WithMany().HasForeignKey(x => x.UsuarioId);
        });
        // Registra las IEntityTypeConfiguration<> del proyecto (ver Data/ModeloAcademico.cs).
        // Este hook solo puede implementarse una vez por assembly, así que esta línea es el
        // punto de extensión: una configuración nueva se recoge sola, sin tocar este archivo.
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(GasDbContext).Assembly);
    }
}
