(() => {
 let perfil;
 const area=document.getElementById('contentArea');
 const full=a=>[a.nombre,a.apellidoPaterno,a.apellidoMaterno].filter(Boolean).join(' ');
 const message=(text,root=area)=>{let p=root.querySelector('[data-api-message]');if(!p){p=document.createElement('p');p.dataset.apiMessage='1';p.setAttribute('role','status');root.append(p);}p.textContent=text;};
 const load=async()=>{await gasSession;perfil=await gasApi('/api/mi-perfil');const nombre=document.querySelector('.user-information strong');if(nombre)nombre.textContent=full(perfil);return perfil;};
 const fill=(selector,values)=>document.querySelectorAll(selector).forEach((input,i)=>input.value=values[i]??'Sin registro');
 async function profile(){
  fill('.profile-fields input',Array(6).fill('Cargando…'));
  try{const a=await load();fill('.profile-fields input',[a.matricula,a.nombre,[a.apellidoPaterno,a.apellidoMaterno].filter(Boolean).join(' '),a.generacion,a.semestre,a.estadoAcademico]);}catch(e){message(e.message);}
 }
 async function thesis(){
  fill('.thesis-student-fields input',Array(4).fill('Cargando…'));fill('.thesis-followup-grid input',Array(4).fill('Sin registro'));
  const save=area.querySelector('.thesis-save-button');save.disabled=true;
  try{
   const a=await load();fill('.thesis-student-fields input',[a.matricula,full(a),a.programa,a.generacion]);
   area.querySelector('.thesis-cancel-button').onclick=()=>document.getElementById('inicioAlumnoButton').click();
   if(a.tesis.length){
    const t=await gasApi(`/api/tesis/${a.tesis[0]}`);
    document.getElementById('tituloTesis').value=t.titulo||'';document.getElementById('resumenTesis').value=t.resumen||'';
    document.getElementById('tituloCounter').textContent=(t.titulo||'').length;document.getElementById('resumenCounter').textContent=(t.resumen||'').length;
    document.getElementById('tituloTesis').readOnly=true;document.getElementById('resumenTesis').readOnly=true;document.getElementById('protocoloTesis').disabled=true;
    const date=v=>v?new Date(v).toLocaleDateString('es-MX'):'Sin registro';
    fill('.thesis-followup-grid input',[t.estado,`${t.avance} %`,date(t.fecha),date(t.revisiones[0]?.fecha||t.fecha)]);
    save.textContent='Tesis registrada';
    const history=document.createElement('section');history.className='thesis-card';area.querySelector('.thesis-page').append(history);await gasTesisDetalle(t.id,history);
   }else{
    save.disabled=false;save.onclick=async()=>{
     save.disabled=true;
     try{
      const data=new FormData();data.append('titulo',document.getElementById('tituloTesis').value.trim());data.append('resumen',document.getElementById('resumenTesis').value.trim());
      const file=document.getElementById('protocoloTesis').files[0];if(!file)throw Error('Selecciona el protocolo PDF.');data.append('protocolo',file);
      const res=await fetch('/api/tesis',{method:'POST',credentials:'same-origin',headers:{'X-GAS-Request':'1'},body:data});const result=await res.json();if(!res.ok)throw Error(result.mensaje||Object.values(result.errors||{}).flat().join(' ')||'No fue posible registrar la tesis.');
      document.getElementById('miTesisButton').click();
     }catch(e){message(e.message);save.disabled=false;}
    };
   }
  }catch(e){message(e.message);}
 }
 async function home(){
  // Inicio reutiliza la tarjeta de perfil ya existente.
  document.getElementById('perfilAlumnoButton').click();
  document.getElementById('perfilAlumnoButton').classList.remove('active');document.getElementById('inicioAlumnoButton').classList.add('active');
  area.querySelector('h2').textContent='Inicio';
 }
 document.getElementById('perfilAlumnoButton').addEventListener('click',profile);
 document.getElementById('miTesisButton').addEventListener('click',thesis);
 document.getElementById('inicioAlumnoButton').addEventListener('click',home);
 // Intercepta exclusivamente los controles que antes eran demostraciones.
 area.addEventListener('click',async e=>{
  const button=e.target.closest('button');if(!button)return;
  if(['tesisOption','articuloOption'].includes(button.id)){
   e.stopImmediatePropagation();button.disabled=true;
   try{const choices=await gasApi('/api/mi-perfil/modalidades');const name=button.id==='tesisOption'?'Tesis':'Artículo científico';const choice=choices.find(x=>x.nombre.toLowerCase()===name.toLowerCase());if(!choice)throw Error('La modalidad no está disponible en el catálogo.');await gasApi(`/api/mi-perfil/modalidad/${choice.id}`,'PUT');document.getElementById('perfilAlumnoButton').click();}catch(e){message(e.message);button.disabled=false;}
  }
  if(button.id==='seguimientoToeflButton'){
   setTimeout(async()=>{try{const a=await load();const dialog=document.getElementById('seguimientoToeflDialog');message(a.toefl.length?a.toefl.map(t=>`${t.estado}: ${t.puntaje??'Sin puntaje'} puntos`).join(' · '):'Tu expediente no tiene un examen TOEFL registrado.',dialog);}catch(e){message(e.message);}},0);
  }
 },true);
 document.getElementById('cerrarSesionAlumnoButton').addEventListener('click',async()=>{try{await gasApi('/api/auth/logout','POST');location.replace('/login.html');}catch(e){message(e.message);}});
 document.querySelector('.user-menu-button').addEventListener('click',()=>location.href='/cuenta.html');
 gasSession.then(me=>{if(String(me.rol||'').trim().toLowerCase()!=='alumno'){location.replace('/cuenta.html');return;}if(me.requiereCambio)return;document.getElementById('tesisSection').classList.add('visible');home();}).catch(e=>message('No se pudo iniciar el portal: '+e.message));
})();
