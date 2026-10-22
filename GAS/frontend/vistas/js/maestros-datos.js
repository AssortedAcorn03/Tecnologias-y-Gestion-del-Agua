(() => {
 const area=document.getElementById('contentArea');
 async function listar(){
  const status=document.createElement('p');area.append(status);status.textContent='Cargando tesis asignadas…';
  try{await gasSession;const rows=await gasApi('/api/tesis');status.textContent=rows.length?'Selecciona una tesis para consultar su seguimiento.':'No tienes tesis asignadas a un comité activo.';
   for(const t of rows){const button=document.createElement('button');button.textContent=`${t.matricula} · ${t.titulo} · ${t.avance??0} %`;const detail=document.createElement('section');button.onclick=()=>gasTesisDetalle(t.id,detail);area.append(button,detail);}
  }catch(e){status.textContent=e.message;}
 }
 ['consultaTesisButton','evaluacionTesisButton','gestionComiteButton'].forEach(id=>document.getElementById(id)?.addEventListener('click',listar));
 document.getElementById('cerrarSesionMaestroButton').addEventListener('click',async()=>{try{await gasApi('/api/auth/logout','POST');location.replace('/login.html');}catch(e){alert(e.message);}});
 gasSession.then(me=>{if(me.rol!=='Profesor'){location.replace('/cuenta.html');return;}if(me.requiereCambio)return;document.getElementById('consultaTesisButton').click();}).catch(()=>{});
})();
