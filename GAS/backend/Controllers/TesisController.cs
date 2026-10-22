using backend.Auth;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
namespace backend.Controllers;

[ApiController, Route("api/tesis"), Authorize]
public class TesisController(GasDbContext db, IWebHostEnvironment env) : ControllerBase {
 private bool Gestion => User.IsInRole(Roles.Administrador) || User.IsInRole(Roles.Coordinador);
 private IQueryable<tesi> Visibles() {
  var uid=User.IdUsuarioRequerido();
  if(Gestion)return db.teses;
  if(User.IsInRole(Roles.Alumno))return db.teses.Where(t=>t.clave_alumnoNavigation.id_usuario==uid && t.clave_alumnoNavigation.activo==true);
  if(User.IsInRole(Roles.Profesor))return db.teses.Where(t=>t.comites.Any(c=>c.comite_profesors.Any(cp=>cp.activo==true && cp.rpeNavigation.profesor_detalles.Any(d=>d.id_usuario==uid && d.activo==true))));
  return db.teses.Where(t=>false);
 }
 private async Task<bool> PuedeEvaluar(int id, bool final=false) {
  if(Gestion)return true;
  if(!User.IsInRole(Roles.Profesor))return false;
  var uid=User.IdUsuarioRequerido();
  return await db.comite_profesors.AnyAsync(cp=>cp.id_comiteNavigation.id_tesis==id && cp.activo==true &&
   (!final || cp.id_rol_comiteNavigation.nombre=="Director" || cp.id_rol_comiteNavigation.nombre=="Codirector") &&
   cp.rpeNavigation.profesor_detalles.Any(d=>d.id_usuario==uid && d.activo==true));
 }
 [HttpGet]
 public async Task<IActionResult> Listar()=>Ok(await Visibles().AsNoTracking().Select(t=>new {
  id=t.id_tesis,t.titulo,matricula=t.clave_alumno,avance=t.porcentaje_actual,estado=t.id_estado_tesisNavigation!.nombre
 }).ToListAsync());
 [HttpGet("{id:int}")]
 public async Task<IActionResult> Consultar(int id) {
  var t=await Visibles().AsNoTracking().Include(x=>x.id_estado_tesisNavigation).SingleOrDefaultAsync(x=>x.id_tesis==id);
  if(t==null)return NotFound();
  var detalle=await db.Set<tesis_seguimiento>().AsNoTracking().SingleOrDefaultAsync(x=>x.id_tesis==id);
  var revisiones=await db.revisions.AsNoTracking().Where(x=>x.id_tesis==id).OrderByDescending(x=>x.id_revision)
   .Select(x=>new {id=x.id_revision,x.fecha,x.comentarios,avance=x.porcentaje_avance,x.estado}).ToListAsync();
  var documentos=await db.documentos.Where(x=>x.id_tesis==id).Select(x=>new {id=x.id_documento,nombre=x.nombre_archivo}).ToListAsync();
  var integrantes=await db.comite_profesors.Where(x=>x.id_comiteNavigation.id_tesis==id && x.activo==true)
   .Select(x=>new {x.rpe,nombre=x.rpeNavigation.nombre,rol=x.id_rol_comiteNavigation.nombre}).ToListAsync();
  return Ok(new {id=t.id_tesis,t.titulo,avance=t.porcentaje_actual??0,estado=t.id_estado_tesisNavigation?.nombre,
   fecha=t.fecha_registro,resumen=detalle?.resumen,resolucion=detalle?.resolucion,dictamen=detalle?.dictamen,
   fechaResolucion=detalle?.fecha_resolucion,revisiones,documentos,integrantes,
   puedeEvaluar=await PuedeEvaluar(id),puedeResolver=await PuedeEvaluar(id,true)});
 }
 public class RegistroInput {
  [Required,MaxLength(255)] public string Titulo {get;set;}="";
  [Required,MaxLength(1000)] public string Resumen {get;set;}="";
  [Required] public IFormFile Protocolo {get;set;}=null!;
 }
 [HttpPost, Authorize(Roles=Roles.Alumno), RequestSizeLimit(11*1024*1024)]
 public async Task<IActionResult> Registrar([FromForm] RegistroInput input) {
  var uid=User.IdUsuarioRequerido();
  var file=input.Protocolo;
  if(file.Length<5 || file.Length>10*1024*1024 || !Path.GetExtension(file.FileName).Equals(".pdf",StringComparison.OrdinalIgnoreCase))
   return BadRequest(new {mensaje="Selecciona un PDF de hasta 10 MB."});
  await using(var stream=file.OpenReadStream()) {
   var signature=new byte[5]; await stream.ReadExactlyAsync(signature);
   if(System.Text.Encoding.ASCII.GetString(signature)!="%PDF-")return BadRequest(new {mensaje="El archivo no es un PDF válido."});
  }
  await using var tx=await db.Database.BeginTransactionAsync();
  var a=(await db.alumnos.FromSqlInterpolated($"SELECT * FROM alumno WHERE id_usuario={uid} FOR UPDATE").ToListAsync()).SingleOrDefault();
  if(a==null || a.activo!=true)return NotFound(new {mensaje="No hay un alumno activo vinculado."});
  if(await db.teses.AnyAsync(t=>t.clave_alumno==a.clave_alumno))return Conflict(new {mensaje="Tu tesis ya está registrada."});
  var estado=await db.CAT_estado_teses.Where(x=>x.nombre=="Sin iniciar").Select(x=>(int?)x.id_estado_tesis).SingleOrDefaultAsync();
  if(estado==null)return StatusCode(503,new {mensaje="Falta el catálogo de estados de tesis."});
  var t=new tesi {clave_alumno=a.clave_alumno,id_programa=a.id_programa,titulo=input.Titulo.Trim(),fecha_registro=DateTime.UtcNow,porcentaje_actual=0,id_estado_tesis=estado};
  db.teses.Add(t); await db.SaveChangesAsync();
  db.Set<tesis_seguimiento>().Add(new tesis_seguimiento {id_tesis=t.id_tesis,resumen=input.Resumen.Trim()});
  var folder=Path.Combine(env.ContentRootPath,"App_Data","protocolos"); Directory.CreateDirectory(folder);
  var name=Guid.NewGuid().ToString("N")+".pdf"; var path=Path.Combine(folder,name);
  try {
   await using(var output=System.IO.File.Create(path))await file.CopyToAsync(output);
   db.documentos.Add(new documento {clave_alumno=a.clave_alumno,id_tesis=t.id_tesis,nombre_archivo=Path.GetFileName(file.FileName)[..Math.Min(Path.GetFileName(file.FileName).Length,255)],ruta_archivo=name,fecha_carga=DateTime.UtcNow});
   await db.SaveChangesAsync(); await tx.CommitAsync();
  } catch { System.IO.File.Delete(path); throw; }
  return Created($"/api/tesis/{t.id_tesis}",new {id=t.id_tesis,mensaje="Tesis y protocolo registrados."});
 }
 [HttpGet("{id:int}/documentos/{documentoId:int}")]
 public async Task<IActionResult> Descargar(int id,int documentoId) {
  if(!await Visibles().AnyAsync(x=>x.id_tesis==id))return NotFound();
  var d=await db.documentos.SingleOrDefaultAsync(x=>x.id_documento==documentoId && x.id_tesis==id);
  if(d?.ruta_archivo==null || Path.GetFileName(d.ruta_archivo)!=d.ruta_archivo)return NotFound();
  var path=Path.Combine(env.ContentRootPath,"App_Data","protocolos",d.ruta_archivo);
  if(!System.IO.File.Exists(path))return NotFound();
  return PhysicalFile(path,"application/pdf",d.nombre_archivo);
 }
 public record AvanceInput([Range(0,100)] decimal Porcentaje,[Required,MaxLength(4000)] string Comentarios,int Version);
 public record ResolucionInput([Required] string Resultado,[Required,MaxLength(4000)] string Dictamen,int Version);
 private async Task<tesi?> Bloquear(int id)=> (await db.teses.FromSqlInterpolated($"SELECT * FROM tesis WHERE id_tesis={id} FOR UPDATE").ToListAsync()).SingleOrDefault();
 private async Task<tesis_seguimiento> Detalle(int id) {
  var d=await db.Set<tesis_seguimiento>().FindAsync(id);
  if(d==null){d=new tesis_seguimiento {id_tesis=id};db.Add(d);}return d;
 }
 private async Task<int> Version(int id)=>await db.revisions.Where(x=>x.id_tesis==id).Select(x=>(int?)x.id_revision).MaxAsync()??0;
 [HttpPost("{id:int}/avances")]
 public async Task<IActionResult> Avance(int id,AvanceInput input) {
  if(!await PuedeEvaluar(id))return Forbid();
  await using var tx=await db.Database.BeginTransactionAsync();
  var t=await Bloquear(id); if(t==null)return NotFound();
  var d=await Detalle(id);
  if(d.resolucion!=null || await db.CAT_estado_teses.AnyAsync(e=>e.id_estado_tesis==t.id_estado_tesis && (e.nombre=="Aceptada" || e.nombre=="No aceptada")))return Conflict(new {mensaje="La tesis ya tiene resolución final."});
  if(input.Version!=await Version(id))return Conflict(new {mensaje="Otro integrante actualizó la tesis. Recarga antes de guardar."});
  if(input.Porcentaje<(t.porcentaje_actual??0))return BadRequest(new {mensaje="El avance no puede disminuir."});
  var nombre=input.Porcentaje==100?"En evaluación":"En progreso";
  var estado=await db.CAT_estado_teses.Where(x=>x.nombre==nombre).Select(x=>(int?)x.id_estado_tesis).SingleOrDefaultAsync();
  if(estado==null)return StatusCode(503,new {mensaje="Falta el catálogo de estados de tesis."});
  t.porcentaje_actual=input.Porcentaje;t.id_estado_tesis=estado;
  var revision=new revision {id_tesis=id,fecha=DateTime.UtcNow,porcentaje_avance=input.Porcentaje,comentarios=input.Comentarios.Trim(),estado=nombre};
  db.revisions.Add(revision);await db.SaveChangesAsync();
  var uid=User.IdUsuarioRequerido();
  var rpe=await db.profesor_detalles.Where(x=>x.id_usuario==uid && x.activo==true).Select(x=>(int?)x.rpe).SingleOrDefaultAsync();
  if(rpe!=null)db.revision_profesors.Add(new revision_profesor {id_revision=revision.id_revision,rpe=rpe.Value,comentarios=input.Comentarios.Trim()});
  await db.SaveChangesAsync();await tx.CommitAsync();return Ok(new {mensaje="Avance registrado."});
 }
 [HttpPost("{id:int}/resolucion")]
 public async Task<IActionResult> Resolver(int id,ResolucionInput input) {
  if(!await PuedeEvaluar(id,true))return Forbid();
  if(input.Resultado!="Aceptada" && input.Resultado!="No aceptada")return BadRequest(new {mensaje="Selecciona Aceptada o No aceptada."});
  await using var tx=await db.Database.BeginTransactionAsync();
  var t=await Bloquear(id);if(t==null)return NotFound();
  var d=await Detalle(id);
  if(d.resolucion!=null || await db.CAT_estado_teses.AnyAsync(e=>e.id_estado_tesis==t.id_estado_tesis && (e.nombre=="Aceptada" || e.nombre=="No aceptada")))return Conflict(new {mensaje="La resolución final ya fue registrada."});
  if(input.Version!=await Version(id))return Conflict(new {mensaje="La tesis cambió. Recarga antes de resolver."});
  if(t.porcentaje_actual!=100 || !await db.comite_profesors.AnyAsync(x=>x.id_comiteNavigation.id_tesis==id && x.activo==true && x.id_rol_comiteNavigation.nombre=="Director"))
   return Conflict(new {mensaje="Se requiere avance de 100 % y un comité con director activo."});
  var estado=await db.CAT_estado_teses.Where(x=>x.nombre==input.Resultado).SingleOrDefaultAsync();
  if(estado==null)return StatusCode(503,new {mensaje="Ejecuta la actualización SQL del catálogo de tesis."});
  d.resolucion=input.Resultado;d.dictamen=input.Dictamen.Trim();d.fecha_resolucion=DateTime.UtcNow;d.usuario_resolucion=User.IdUsuarioRequerido();
  t.id_estado_tesis=estado.id_estado_tesis;
  db.revisions.Add(new revision {id_tesis=id,fecha=d.fecha_resolucion,porcentaje_avance=t.porcentaje_actual,estado=input.Resultado,comentarios=input.Dictamen.Trim()});
  await db.SaveChangesAsync();await tx.CommitAsync();return Ok(new {mensaje="Resolución final registrada."});
 }
}
