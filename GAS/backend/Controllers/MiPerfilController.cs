using backend.Auth;
using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace backend.Controllers;
[ApiController, Route("api/mi-perfil"), Authorize(Roles = Roles.Alumno)]
public class MiPerfilController(GasDbContext db) : ControllerBase {
 [HttpGet]
 public async Task<IActionResult> Consultar() {
  var uid = User.IdUsuarioRequerido();
  var a = await db.alumnos.AsNoTracking().Include(x=>x.id_programaNavigation)
   .Include(x=>x.id_generacionNavigation).Include(x=>x.id_estado_academicoNavigation)
   .Include(x=>x.id_modalidadNavigation).Include(x=>x.alumno_detalles)
   .SingleOrDefaultAsync(x=>x.id_usuario==uid && x.activo==true);
  if(a==null) return NotFound(new {mensaje="Tu cuenta no tiene un alumno activo vinculado. Solicita al administrador revisar el alta de alumno."});
  var tesis = await db.teses.Where(t=>t.clave_alumno==a.clave_alumno).Select(t=>t.id_tesis).ToListAsync();
  var toefl = await db.requisito_toefls.AsNoTracking().Where(t=>t.clave_alumno==a.clave_alumno)
    .Select(t=>new {t.puntaje, t.fecha_presentacion, estado=t.id_estado_toeflNavigation!.nombre}).ToListAsync();
  return Ok(new {matricula=a.clave_alumno,a.nombre,apellidoPaterno=a.apellido_paterno,apellidoMaterno=a.apellido_materno,
   programa=a.id_programaNavigation?.nombre,generacion=a.id_generacionNavigation?.nombre_generacion,
   estadoAcademico=a.id_estado_academicoNavigation?.nombre,modalidad=a.id_modalidadNavigation?.nombre,
   semestre=a.alumno_detalles.OrderByDescending(x=>x.id_periodo).Select(x=>x.semestre).FirstOrDefault(),tesis,toefl});
 }
 [HttpPut("modalidad/{id:int}")]
 public async Task<IActionResult> Modalidad(int id) {
  var uid=User.IdUsuarioRequerido();
  var a=await db.alumnos.SingleOrDefaultAsync(x=>x.id_usuario==uid && x.activo==true);
  if(a==null)return NotFound();
  if(!await db.CAT_modalidad_titulacions.AnyAsync(x=>x.id_modalidad==id && x.activo==true))return BadRequest();
  if(await db.teses.AnyAsync(x=>x.clave_alumno==a.clave_alumno))return Conflict(new {mensaje="Ya existe una tesis. Solicita al coordinador el cambio de modalidad."});
  a.id_modalidad=id; await db.SaveChangesAsync(); return Ok(new {mensaje="Modalidad guardada."});
 }
 [HttpGet("modalidades")]
 public async Task<IActionResult> Modalidades()=>Ok(await db.CAT_modalidad_titulacions.Where(x=>x.activo==true).Select(x=>new {id=x.id_modalidad,x.nombre}).ToListAsync());
}
