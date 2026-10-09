using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace backend.Data;

// Las claves primarias de estas tres tablas son claves de negocio asignadas
// FUERA del sistema, sin AUTO_INCREMENT en el esquema (database/DB.sql).
// Por convención, EF Core trata cualquier PK entera como identidad generada por
// la base de datos: omitiría la columna del INSERT, MySQL guardaría 0, y el
// segundo registro chocaría con clave duplicada.
//
// ValueGeneratedNever() es la forma de decirle a EF "esta clave la traemos
// nosotros, no la generes".
//
// Estas clases viven aparte del contexto generado a propósito: el scaffolding
// reescribe Data/GasDbContext.cs y Models/*.cs, pero no toca este archivo.
// Se registran desde el OnModelCreatingPartial de SeguridadDb.cs mediante
// ApplyConfigurationsFromAssembly, así que añadir una configuración nueva no
// requiere volver a tocar ese archivo.

/// <summary>
/// `alumno.clave_alumno` es la clave de 6 cifras que asigna la universidad.
/// GAS solo la copia al importar; nunca la genera.
/// </summary>
public class AlumnoConfig : IEntityTypeConfiguration<alumno>
{
    public void Configure(EntityTypeBuilder<alumno> entity) =>
        entity.Property(x => x.clave_alumno).ValueGeneratedNever();
}

/// <summary>`profesor.rpe` es el Registro de Personal, también externo.</summary>
public class ProfesorConfig : IEntityTypeConfiguration<profesor>
{
    public void Configure(EntityTypeBuilder<profesor> entity) =>
        entity.Property(x => x.rpe).ValueGeneratedNever();
}

/// <summary>
/// `egresado.clave_alumno` es además FK hacia `alumno`: comparte la misma
/// clave, así que tampoco se genera.
/// </summary>
public class EgresadoConfig : IEntityTypeConfiguration<egresado>
{
    public void Configure(EntityTypeBuilder<egresado> entity) =>
        entity.Property(x => x.clave_alumno).ValueGeneratedNever();
}
