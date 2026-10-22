using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
namespace backend.Data;
public class TesisConfig : IEntityTypeConfiguration<tesis_seguimiento> {
 public void Configure(EntityTypeBuilder<tesis_seguimiento> e) {
  e.Property(x => x.id_tesis).ValueGeneratedNever();
  e.HasOne<tesi>().WithOne().HasForeignKey<tesis_seguimiento>(x => x.id_tesis);
 }
}
