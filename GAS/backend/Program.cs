using backend.Auth;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("GasDb")
    ?? throw new InvalidOperationException("Configura ConnectionStrings:GasDb con dotnet user-secrets.");
builder.Services.AddDbContext<GasDbContext>(options => options.UseMySQL(connectionString));
builder.Services.AddControllers();
builder.Services.AddScoped<ValidarSesion>();
builder.Services.AddScoped<CorreoRecuperacion>();
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
app.MapGet("/api/roles", async (GasDbContext db) => await db.CAT_rol_usuarios.Where(r => r.activo == true).OrderBy(r => r.id_rol_usuario).Select(r => new { id = r.id_rol_usuario, r.nombre }).ToListAsync()).RequireAuthorization("GestionUsuarios");
app.MapGet("/api/alumnos", async (GasDbContext db) => await db.alumnos.Where(a => a.activo == true).OrderBy(a => a.apellido_paterno).Select(a => new {
    a.clave_alumno, nombreCompleto = a.nombre + " " + a.apellido_paterno + " " + a.apellido_materno,
    a.correo_institucional, programa = a.id_programaNavigation!.nombre, estado = a.id_estado_academicoNavigation!.nombre
}).ToListAsync()).RequireAuthorization("GestionUsuarios");
app.Run();
