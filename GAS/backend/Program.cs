using backend.Auth;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Threading.RateLimiting;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(new WebApplicationOptions
{
    Args = args,
    WebRootPath = "../frontend/vistas"
});
var connectionString = builder.Configuration.GetConnectionString("GasDb")
    ?? throw new InvalidOperationException("Configura ConnectionStrings:GasDb con dotnet user-secrets.");
builder.Services.AddDbContext<GasDbContext>(options => options.UseMySQL(connectionString));
builder.Services.AddControllers();
builder.Services.AddScoped<ValidarSesion>();
builder.Services.AddScoped<CorreoRecuperacion>();
builder.Services.AddScoped<UniversidadExterna>();
builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie(o => {
    o.Cookie.Name = "GAS.Sesion"; o.Cookie.HttpOnly = true; o.Cookie.SameSite = SameSiteMode.Strict;
    o.Cookie.SecurePolicy = builder.Environment.IsDevelopment() ? CookieSecurePolicy.SameAsRequest : CookieSecurePolicy.Always;
    o.ExpireTimeSpan = TimeSpan.FromHours(8); o.SlidingExpiration = false; o.EventsType = typeof(ValidarSesion);
});
builder.Services.AddAuthorization(o => o.AddPolicy("GestionUsuarios", p => p.RequireRole(Roles.Administrador, Roles.Coordinador)));
builder.Services.AddRateLimiter(o => {
    o.RejectionStatusCode = 429;
    o.AddPolicy("auth", context => RateLimitPartition.GetFixedWindowLimiter(context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 20, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
    o.AddPolicy("recovery", context => RateLimitPartition.GetFixedWindowLimiter(context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 5, Window = TimeSpan.FromMinutes(10), QueueLimit = 0 }));
});
builder.Services.AddOpenApi();
var app = builder.Build();

// Creación LOCAL del primer administrador: sin endpoint público ni contraseña en código.
if (args.Contains("--crear-admin")) {
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<GasDbContext>();
    var email = Environment.GetEnvironmentVariable("GAS_ADMIN_CORREO")?.Trim().ToLowerInvariant();
    var password = Environment.GetEnvironmentVariable("GAS_ADMIN_PASSWORD");
    if (email == null || !new System.ComponentModel.DataAnnotations.EmailAddressAttribute().IsValid(email) || email.Length > 100 || !Seguridad.PasswordValida(password))
        throw new InvalidOperationException("Define GAS_ADMIN_CORREO y GAS_ADMIN_PASSWORD (12-128 caracteres, letras y números).");
    if (await db.usuarios.AnyAsync(u => u.id_rol_usuarioNavigation!.nombre == Roles.Administrador && u.activo == true))
        throw new InvalidOperationException("Ya existe un administrador activo. Utiliza el panel o recuperación.");
    if (await db.usuarios.AnyAsync(u => u.correo == email)) throw new InvalidOperationException("Ese correo ya existe.");
    var rol = await db.CAT_rol_usuarios.SingleAsync(r => r.nombre == Roles.Administrador && r.activo == true);
    var u = new usuario { correo = email, nombre = "Administrador inicial", activo = true, id_rol_usuario = rol.id_rol_usuario, intentos_fallidos = 0, fecha_creacion = DateTime.UtcNow, requiere_cambio = true };
    u.contrasena_hash = new PasswordHasher<usuario>().HashPassword(u, password!);
    db.usuarios.Add(u); await db.SaveChangesAsync();
    Console.WriteLine("Administrador creado. Cambia la contraseña al iniciar sesión."); return;
}
if (app.Environment.IsDevelopment()) app.MapOpenApi();
else { app.UseExceptionHandler("/error"); app.UseHsts(); app.UseHttpsRedirection(); }
app.UseRouting();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
// wwwroot utiliza el mismo origen. Exigimos cabecera no simple en toda mutación API;
// sin CORS, un sitio externo no puede enviarla. Cookie Strict agrega otra barrera CSRF.
app.Use(async (context, next) => {
    if (context.Request.Path.StartsWithSegments("/api")) {
        context.Response.Headers.CacheControl = "no-store";
        if (context.Request.Method != "GET" && context.Request.Method != "HEAD" && context.Request.Headers["X-GAS-Request"] != "1") {
            context.Response.StatusCode = 400; await context.Response.WriteAsJsonAsync(new { mensaje = "Falta la cabecera X-GAS-Request." }); return;
        }
        if (context.User.Identity?.IsAuthenticated == true && !context.Request.Path.StartsWithSegments("/api/auth")) {
            var db = context.RequestServices.GetRequiredService<GasDbContext>();
            var id = context.User.IdUsuarioRequerido();
            if (await db.usuarios.AnyAsync(u => u.id_usuario == id && u.requiere_cambio == true)) {
                context.Response.StatusCode = 403; await context.Response.WriteAsJsonAsync(new { mensaje = "Primero cambia tu contraseña inicial." }); return;
            }
        }
    }
    if (context.Request.Path == "/coordinador.html" &&
        !(context.User.IsInRole(Roles.Administrador) || context.User.IsInRole(Roles.Coordinador))) {
        context.Response.Redirect("/login.html"); return;
    }
    await next();
});
app.UseStaticFiles();
app.MapControllers();
app.MapGet("/", () => Results.Redirect("/login.html"));
app.Map("/error", () => Results.Problem("Ocurrió un error interno. Contacta al administrador."));
app.MapGet("/health/db", async (GasDbContext db) => await db.Database.CanConnectAsync() ? Results.Ok(new { estado = "ok" }) : Results.Problem("Base de datos no disponible.")).RequireAuthorization("GestionUsuarios");
// Gemelo de /health/db para la base de la universidad. 503 si no está configurada:
// es una dependencia opcional y su ausencia no debe parecer una caída.
app.MapGet("/health/universidad", async (UniversidadExterna universidad) =>
    !universidad.Configurado ? Results.Json(new { mensaje = "La conexión con la base de la universidad no está configurada." }, statusCode: 503)
    : await universidad.Disponible() ? Results.Ok(new { estado = "ok" })
    : Results.Json(new { mensaje = "La base de la universidad no responde." }, statusCode: 503)).RequireAuthorization("GestionUsuarios");
app.MapGet("/api/roles", async (GasDbContext db) => await db.CAT_rol_usuarios.Where(r => r.activo == true).OrderBy(r => r.id_rol_usuario).Select(r => new { id = r.id_rol_usuario, r.nombre }).ToListAsync()).RequireAuthorization("GestionUsuarios");
// Catálogos que alimentan los selects del alta e importación de alumnos.
app.MapGet("/api/programas", async (GasDbContext db) => await db.CAT_programa_academicos.Where(p => p.activo == true).OrderBy(p => p.nombre).Select(p => new { id = p.id_programa, p.nombre }).ToListAsync()).RequireAuthorization("GestionUsuarios");
app.MapGet("/api/modalidades", async (GasDbContext db) => await db.CAT_modalidad_titulacions.Where(m => m.activo == true).OrderBy(m => m.id_modalidad).Select(m => new { id = m.id_modalidad, m.nombre }).ToListAsync()).RequireAuthorization("GestionUsuarios");
// CAT_estado_academico no tiene columna `activo`, a diferencia de los otros catálogos: no se filtra.
app.MapGet("/api/estados-academicos", async (GasDbContext db) => await db.CAT_estado_academicos.OrderBy(e => e.id_estado_academico).Select(e => new { id = e.id_estado_academico, e.nombre }).ToListAsync()).RequireAuthorization("GestionUsuarios");
// `generacion` y `periodo_academico` son datos operativos, no catálogos CAT_: se siembran en database/seed.sql.
app.MapGet("/api/generaciones", async (GasDbContext db, int? programaId) => await db.generacions.Where(g => programaId == null || g.id_programa == programaId).OrderByDescending(g => g.anio_ingreso).Select(g => new { id = g.id_generacion, nombre = g.nombre_generacion, programaId = g.id_programa, anioIngreso = g.anio_ingreso }).ToListAsync()).RequireAuthorization("GestionUsuarios");
app.MapGet("/api/periodos", async (GasDbContext db) => await db.periodo_academicos.OrderByDescending(p => p.fecha_inicio).Select(p => new { id = p.id_periodo, p.nombre, tipoPeriodo = p.tipo_periodo, fechaInicio = p.fecha_inicio, fechaFin = p.fecha_fin }).ToListAsync()).RequireAuthorization("GestionUsuarios");
// GET /api/alumnos vive ahora en Controllers/AlumnosController.Listar, con paginación y filtros.
app.Run();
