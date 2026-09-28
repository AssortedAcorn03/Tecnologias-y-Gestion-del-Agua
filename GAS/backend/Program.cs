using backend.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// La cadena de conexión vive en los secretos de usuario, no en appsettings.json:
//   dotnet user-secrets set "ConnectionStrings:GasDb" "Server=...;Password=...;"
var connectionString = builder.Configuration.GetConnectionString("GasDb")
    ?? throw new InvalidOperationException(
        "Falta la cadena de conexión 'GasDb'. Configúrala con: " +
        "dotnet user-secrets set \"ConnectionStrings:GasDb\" \"Server=localhost;...\"");

builder.Services.AddDbContext<GasDbContext>(options =>
    options.UseMySQL(connectionString));

// El frontend Next.js corre en otro origen (:3000), así que sin esto
// el navegador bloquea sus llamadas. Las páginas de wwwroot no lo
// necesitan: se sirven desde este mismo origen.
const string FrontendCors = "frontend";
builder.Services.AddCors(options =>
    options.AddPolicy(FrontendCors, policy => policy
        .WithOrigins("http://localhost:3000")
        .AllowAnyHeader()
        .AllowAnyMethod()));

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
else
{
    // En desarrollo se usa el perfil http (:5298), donde redirigir a https rompe las llamadas.
    app.UseHttpsRedirection();
}

// Permite servir archivos HTML, CSS, JS e imágenes
// desde la carpeta wwwroot.
app.UseStaticFiles();

app.UseCors(FrontendCors);

// Comprueba que el backend realmente alcanza MySQL.
app.MapGet("/health/db", async (GasDbContext db) =>
{
    var puedeConectar = await db.Database.CanConnectAsync();
    return puedeConectar
        ? Results.Ok(new { estado = "ok", baseDatos = db.Database.GetDbConnection().Database })
        : Results.Problem("No se pudo conectar a la base de datos.");
});

app.MapGet("/api/roles", async (GasDbContext db) =>
    await db.CAT_rol_usuarios
        .Where(r => r.activo == true)
        .OrderBy(r => r.id_rol_usuario)
        .Select(r => new { r.id_rol_usuario, r.nombre, r.descripcion })
        .ToListAsync());

app.MapGet("/api/alumnos", async (GasDbContext db) =>
    await db.alumnos
        .Where(a => a.activo == true)
        .OrderBy(a => a.apellido_paterno)
        .Select(a => new
        {
            a.clave_alumno,
            nombreCompleto = a.nombre + " " + a.apellido_paterno + " " + a.apellido_materno,
            a.correo_institucional,
            programa = a.id_programaNavigation!.nombre,
            estado = a.id_estado_academicoNavigation!.nombre
        })
        .ToListAsync());

app.Run();
