namespace backend.Auth;

/// <summary>
/// Nombres de los roles del sistema.
///
/// Cada valor debe coincidir EXACTAMENTE con la columna `nombre` de
/// `CAT_rol_usuario`, tal como la carga `database/seed.sql`. Si alguno se
/// desincroniza, la autorización falla en silencio: nadie obtiene el rol y
/// no se produce ningún error visible.
///
/// Existen para evitar precisamente eso. Escribir `RequireRole("Cordinador")`
/// compila sin quejarse y deja fuera a todos los coordinadores; escribir
/// `RequireRole(Roles.Cordinador)` no compila.
/// </summary>
public static class Roles
{
    public const string Coordinador = "Coordinador";
    public const string Administrador = "Administrador";
    public const string Profesor = "Profesor";
    public const string Alumno = "Alumno";
    public const string Egresado = "Egresado";
    
    public static readonly string[] Todos =
    [
        Coordinador,
        Administrador,
        Profesor,
        Alumno,
        Egresado
    ];
}
