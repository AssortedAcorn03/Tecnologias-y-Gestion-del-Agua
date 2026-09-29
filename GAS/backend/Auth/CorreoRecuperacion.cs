using System.Net;
using System.Net.Mail;
namespace backend.Auth;
public class CorreoRecuperacion(IConfiguration config)
{
    public bool Configurado => !string.IsNullOrWhiteSpace(config["Smtp:Host"]) && !string.IsNullOrWhiteSpace(config["Smtp:From"]) && Uri.TryCreate(config["Seguridad:UrlPublica"], UriKind.Absolute, out _);
    public async Task Enviar(string correo, string token)
    {
        var url = config["Seguridad:UrlPublica"]!.TrimEnd('/') + "/recuperar.html#token=" + token;
        using var client = new SmtpClient(config["Smtp:Host"], config.GetValue<int>("Smtp:Port", 587)) {
            EnableSsl = config.GetValue<bool>("Smtp:EnableSsl", true),
            Credentials = new NetworkCredential(config["Smtp:User"], config["Smtp:Password"])
        };
        using var mail = new MailMessage(config["Smtp:From"]!, correo, "Recuperación de acceso", "Restablece tu contraseña con este enlace (vence en 30 minutos y solo se usa una vez):\n" + url + "\nSi no lo solicitaste, ignora este mensaje.");
        await client.SendMailAsync(mail);
    }
}
