// Ejecutar: node tests/perfiles_frontend.cjs (desde GAS).
const vm=require('node:vm'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'../frontend/vistas/js');
(async()=>{
 for(const [rol,requiereCambio,destino] of [['Alumno',false,'/alumno.html'],['Profesor',false,'/maestros.html'],['Administrador',false,'/coordinador.html'],['Coordinador',false,'/coordinador.html'],['Alumno',true,'/cuenta.html'],['Egresado',false,''],[' alumno ',false,'/alumno.html']]){
  const element=()=>({value:'test@example.com',append(){},setAttribute(){},addEventListener(){}});
  const context={document:{querySelector:element,createElement:element,getElementById:element},location:{search:'',href:'',replace(value){this.href=value;}},URLSearchParams,gasApi:async()=>({rol,requiereCambio})};
  vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'login.js'),'utf8'),context);await vm.runInContext('login()',context);assert.equal(context.location.href,destino);
 }
 let request;
 const context={window:{},location:{replace(){}},fetch:async(p,options)=>{request={p,options};return {ok:true,json:async()=>({ok:true})};}};
 vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'api.js'),'utf8'),context);
 await context.window.gasApi('/api/tesis/1/avances','POST',{porcentaje:50,comentarios:'Avance',version:3});
 assert.equal(request.options.headers['X-GAS-Request'],'1');assert.equal(request.options.credentials,'same-origin');assert.equal(JSON.parse(request.options.body).version,3);
 context.fetch=async()=>({ok:false,status:409,json:async()=>({mensaje:'La tesis cambió'})});
 await assert.rejects(context.window.gasApi('/api/tesis/1/avances','POST',{}),/La tesis cambió/);
 for(const file of fs.readdirSync(root).filter(x=>x.endsWith('.js')))new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file});
 console.log('OK: 7 rutas por rol/cambio obligatorio, cabecera de seguridad, versión de avance, conflicto y sintaxis de todos los scripts.');
})().catch(e=>{console.error(e);process.exitCode=1;});
