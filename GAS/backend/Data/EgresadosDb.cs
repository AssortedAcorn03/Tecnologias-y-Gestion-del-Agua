using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Data;

// Configuración de la columna que añade database/egresados.sql a detalle_empleo.
// Se registra sola gracias al ApplyConfigurationsFromAssembly de SeguridadDb.cs.
// La de `egresado.otros_contactos` vive en ModeloAcademico.cs, dentro del
// EgresadoConfig que ya existía: una sola clase de configuración por entidad.

public class DetalleEmpleoConfig : IEntityTypeConfiguration<detalle_empleo>
{
    public void Configure(EntityTypeBuilder<detalle_empleo> entity) =>
        entity.Property(x => x.actividades).HasColumnType("text");
}

// Columnas que añade database/tesis.sql (RF-01.10).
public class TesisConfig : IEntityTypeConfiguration<tesi>
{
    public void Configure(EntityTypeBuilder<tesi> entity)
    {
        entity.Property(x => x.resumen).HasColumnType("text");
        entity.Property(x => x.ultima_actualizacion).HasColumnType("datetime");
        entity.Property(x => x.linea_investigacion).HasMaxLength(255);
        entity.Property(x => x.estado_solicitud).HasMaxLength(20).HasDefaultValue(EstadoSolicitudTesis.Pendiente);
        entity.Property(x => x.motivo_rechazo).HasMaxLength(255);
        entity.Property(x => x.fecha_solicitud).HasColumnType("date");
        entity.Property(x => x.fecha_resolucion).HasColumnType("date");
        // Las dos FK nuevas se declaran sin propiedad de navegación: la modalidad y
        // el director se leen por consulta explícita, no por Include.
        entity.HasOne<CAT_modalidad_titulacion>().WithMany().HasForeignKey(x => x.id_modalidad);
        entity.HasOne<profesor>().WithMany().HasForeignKey(x => x.rpe_director);
    }
}

public class RevisionConfig : IEntityTypeConfiguration<revision>
{
    public void Configure(EntityTypeBuilder<revision> entity) =>
        entity.Property(x => x.criterios).HasColumnType("text");
}
