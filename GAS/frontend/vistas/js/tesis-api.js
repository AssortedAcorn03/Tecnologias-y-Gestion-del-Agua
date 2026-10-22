// Extensión funcional: reutiliza las tarjetas y botones del diseño existente.
window.gasTesisDetalle = async function(id, container) {
    container.replaceChildren();
    const status=document.createElement('p'); status.setAttribute('role','status'); container.append(status);
    try {
        const t=await gasApi(`/api/tesis/${id}`);
        const line=text=>{const p=document.createElement('p');p.textContent=text;container.append(p);};
        line(`${t.titulo} · ${t.estado || 'Sin iniciar'} · Avance: ${t.avance} %`);
        t.integrantes.forEach(i=>line(`${i.rol}: ${i.nombre} (RPE ${i.rpe})`));
        t.documentos.forEach(d=>{const a=document.createElement('a');a.href=`/api/tesis/${id}/documentos/${d.id}`;a.textContent=d.nombre;a.target='_blank';a.rel='noopener';container.append(a);});
        if(t.resolucion)line(`Resolución final: ${t.resolucion}. ${t.dictamen}`);
        t.revisiones.forEach(r=>line(`${new Date(r.fecha).toLocaleDateString('es-MX')} · ${r.avance} % · ${r.estado}: ${r.comentarios}`));
        if(!t.resolucion && t.puedeEvaluar){
            const form=document.createElement('form');
            form.innerHTML='<label>Porcentaje de avance <input name="porcentaje" type="number" min="0" max="100" step="0.01" required></label><label>Comentarios de evaluación <textarea name="comentarios" maxlength="4000" required></textarea></label><button type="submit">Guardar avance</button>';
            form.elements.porcentaje.value=t.avance;
            form.onsubmit=async e=>{e.preventDefault();const b=form.querySelector('button');b.disabled=true;try{await gasApi(`/api/tesis/${id}/avances`,'POST',{porcentaje:Number(form.elements.porcentaje.value),comentarios:form.elements.comentarios.value,version:t.revisiones[0]?.id||0});await gasTesisDetalle(id,container);}catch(e){status.textContent=e.message;b.disabled=false;}};
            container.append(form);
        }
        if(!t.resolucion && t.puedeResolver){
            const form=document.createElement('form');
            form.innerHTML='<label>Resolución final <select name="resultado"><option>Aceptada</option><option>No aceptada</option></select></label><label>Dictamen <textarea name="dictamen" maxlength="4000" required></textarea></label><button type="submit">Registrar resolución final</button>';
            form.onsubmit=async e=>{e.preventDefault();if(!confirm('¿Registrar el dictamen final? La tesis quedará cerrada.'))return;const b=form.querySelector('button');b.disabled=true;try{await gasApi(`/api/tesis/${id}/resolucion`,'POST',{resultado:form.elements.resultado.value,dictamen:form.elements.dictamen.value,version:t.revisiones[0]?.id||0});await gasTesisDetalle(id,container);}catch(e){status.textContent=e.message;b.disabled=false;}};
            container.append(form);
        }
    }catch(e){status.textContent=e.message;}
};
