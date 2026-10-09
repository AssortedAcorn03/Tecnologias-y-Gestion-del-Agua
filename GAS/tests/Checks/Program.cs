using backend.Auth;
using backend.Models;
using backend.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
void Check(bool value, string label) { if (!value) throw new Exception(label); Console.WriteLine("PASS " + label); }
Check(!Seguridad.PasswordValida("short1"), "reject short password");
Check(!Seguridad.PasswordValida("abcdefghijkl"), "reject no digits");
Check(Seguridad.PasswordValida("PruebaPassword123"), "valid password");
var u = new usuario(); u.contrasena_hash = new PasswordHasher<usuario>().HashPassword(u, "PruebaPassword123");
Check(Seguridad.Verificar(u, "PruebaPassword123"), "verify correct password");
Check(!Seguridad.Verificar(u, "WrongPassword123"), "reject wrong password");
u.contrasena_hash = "legacy-invalid";
Check(!Seguridad.Verificar(u, "PruebaPassword123"), "reject malformed hash without exception");
var token = Seguridad.Token();
Check(token.Length == 64 && token != Seguridad.Token(), "random recovery/session tokens");
Check(Seguridad.Hash(token).Length == 64 && Seguridad.Hash(token) != token, "store token digest only");
using var db = new GasDbContext(new DbContextOptionsBuilder<GasDbContext>().UseMySQL("Server=localhost;Database=testing;User=test;Password=unused").Options);
var schema = db.Database.GenerateCreateScript();
Check(schema.Contains("sesion_usuario") && schema.Contains("clave_institucional"), "EF model includes security schema");

// Las PK asignadas por la universidad no deben tratarse como identidad: si alguien
// re-scaffoldea y pierde ApplyConfigurationsFromAssembly en SeguridadDb.cs, esto falla
// antes de que un alumno se inserte con clave 0 (ver Data/ModeloAcademico.cs).
foreach (var (tipo, propiedad) in new (Type, string)[] {
    (typeof(alumno), nameof(alumno.clave_alumno)),
    (typeof(profesor), nameof(profesor.rpe)),
    (typeof(egresado), nameof(egresado.clave_alumno)) })
{
    var pk = db.Model.FindEntityType(tipo)!.FindProperty(propiedad)!;
    Check(pk.ValueGenerated == Microsoft.EntityFrameworkCore.Metadata.ValueGenerated.Never,
        $"{tipo.Name}.{propiedad} no se trata como identidad");
}
Console.WriteLine("All checks passed.");
