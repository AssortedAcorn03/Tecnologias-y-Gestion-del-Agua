using System.Net;
using System.Net.Mail;
namespace backend.Auth;

/// <summary>
/// Entrega del enlace de recuperación de acceso (RF-08.6).
///
/// Tiene dos modos:
///
///   · SMTP: configurado con Smtp:Host y Smtp:From, envía el correo de verdad.
///     Es el único modo válido en producción.
///
///   · Desarrollo: si NO hay SMTP y el entorno es Development, el enlace se
///     escribe en el log del servidor en lugar de enviarse. Permite probar y
///     demostrar el ciclo completo sin credenciales de correo.
///
/// El modo desarrollo está atado a IHostEnvironment.IsDevelopment() a propósito:
/// escribir enlaces de recuperación en un log es aceptable en una máquina local,
/// pero en producción sería una vía para secuestrar cuentas a quien pueda leer
/// los registros. Fuera de Development, sin SMTP, la recuperación queda
/// deshabilitada y el controlador responde 503.
/// </summary>
public class CorreoRecuperacion(IConfiguration config, IHostEnvironment entorno, ILogger<CorreoRecuperacion> logger)
{
    // En desarrollo el backend se sirve a sí mismo, así que la URL del enlace es
    // conocida y no hace falta configurarla para probar.
    private const string UrlDesarrollo = "http://localhost:5298";

    private bool SmtpConfigurado =>
        !string.IsNullOrWhiteSpace(config["Smtp:Host"]) && !string.IsNullOrWhiteSpace(config["Smtp:From"]);

    private string? UrlPublica =>
        Uri.TryCreate(config["Seguridad:UrlPublica"], UriKind.Absolute, out var u) ? u.ToString()
        : entorno.IsDevelopment() ? UrlDesarrollo
        : null;

    /// <summary>El enlace se muestra en el log en vez de enviarse por correo.</summary>
    public bool ModoDesarrollo => !SmtpConfigurado && entorno.IsDevelopment();

    /// <summary>¿Se puede entregar el enlace de alguna forma?</summary>
    public bool Configurado => UrlPublica != null && (SmtpConfigurado || ModoDesarrollo);

    public async Task Enviar(string correo, string token)
    {
        var url = UrlPublica!.TrimEnd('/') + "/recuperar.html#token=" + token;

        if (ModoDesarrollo)
        {
            // Nivel Warning para que destaque entre el ruido de EF Core, y con el
            // aviso explícito de que esto no debe ocurrir en producción.
            logger.LogWarning(
                "\n┌─────────────────────────────────────────────────────────────\n" +
                "│ MODO DESARROLLO · el correo NO se envió\n" +
                "│ Para:   {Correo}\n" +
                "│ Enlace: {Url}\n" +
                "│ Vence en 30 minutos · un solo uso\n" +
                "│ Configura Smtp:Host y Smtp:From para enviarlo de verdad.\n" +
                "└─────────────────────────────────────────────────────────────",
                correo, url);
            return;
        }

        using var client = new SmtpClient(config["Smtp:Host"], config.GetValue<int>("Smtp:Port", 587)) {
            EnableSsl = config.GetValue<bool>("Smtp:EnableSsl", true),
            Credentials = new NetworkCredential(config["Smtp:User"], config["Smtp:Password"])
        };
        using var mail = new MailMessage(config["Smtp:From"]!, correo, "Recuperación de acceso",
            "Restablece tu contraseña con este enlace (vence en 30 minutos y solo se usa una vez):\n" + url +
            "\nSi no lo solicitaste, ignora este mensaje.");
        await client.SendMailAsync(mail);
    }
}
