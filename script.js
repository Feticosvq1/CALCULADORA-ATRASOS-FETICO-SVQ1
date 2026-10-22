const annual={x1:22,x2:22,x3:22,x4:22,x5:22,x6:18,x7:22,x8:18,x9:15,x10:22};
const $=id=>document.getElementById(id);
const fmt=n=>new Intl.NumberFormat('es-ES',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n);
let nextId=1;
function makePeriod(){
 const id=nextId++;
 return `<section class="card period-card" data-id="${id}"><div class="period-head"><div><span class="period-label">PERIODO</span><h2>Datos del contrato</h2></div><button type="button" class="remove-button" data-remove="${id}" aria-label="Eliminar periodo">Eliminar periodo ✕</button></div><div class="grid">
 <label>Turno<select data-field="shift"><option value="x1">X1</option><option value="x2">X2</option><option value="x3">X3</option><option value="x4">X4</option><option value="x5">X5</option><option value="x6">X6</option><option value="x7">X7</option><option value="x8">X8</option><option value="x9" selected>X9</option><option value="x10">X10</option></select></label>
 <label>Inicio de contrato<input data-field="start" type="date" value="2026-01-01" /></label>
 <label>Fin de contrato<input data-field="end" type="date" value="2026-01-31" /></label>
 <label>Días de vacaciones disfrutados<input data-field="taken" type="number" min="0" step="1" value="0" /></label>
 </div><div class="error" data-field="error" hidden></div><div class="period-result" data-field="result"></div></section>`;
}
function cards(){return [...document.querySelectorAll('.period-card')];}
function renumber(){
 const all=cards();
 all.forEach((card,i)=>{card.querySelector('.period-label').textContent=`PERIODO ${i+1}`;card.querySelector('[data-remove]').disabled=all.length===1;});
 $('periodCount').textContent=`${all.length} ${all.length===1?'periodo':'periodos'}`;
}
function setDateLimits(card){
 const start=card.querySelector('[data-field="start"]'), end=card.querySelector('[data-field="end"]');
 if(!start.value){end.removeAttribute('min');end.removeAttribute('max');return;}
 end.min=start.value;
 end.max=`${start.value.slice(0,4)}-12-31`;
}
function periodData(card){
 const shift=card.querySelector('[data-field="shift"]').value;
 const start=card.querySelector('[data-field="start"]').value;
 const end=card.querySelector('[data-field="end"]').value;
 const taken=Math.max(0,Math.floor(Number(card.querySelector('[data-field="taken"]').value)||0));
 const error=card.querySelector('[data-field="error"]'), result=card.querySelector('[data-field="result"]');
 error.hidden=true;error.textContent='';
 if(!start||!end){error.hidden=false;error.textContent='Indica la fecha de inicio y fin.';result.innerHTML='';return {valid:false,accrued:0,taken:0};}
 const s=new Date(start+'T12:00:00'),e=new Date(end+'T12:00:00'),year=start.slice(0,4);
 if(end<start||end.slice(0,4)!==year){error.hidden=false;error.textContent=`La fecha fin debe estar entre el inicio y el 31/12/${year}.`;result.innerHTML='';return {valid:false,accrued:0,taken};}
 const days=Math.floor((e-s)/86400000)+1;
 const yearDays=(new Date(s.getFullYear(),1,29).getMonth()===1)?366:365;
 const accrued=days/yearDays*annual[shift], rounded=Math.round(accrued), remaining=rounded-taken;
 result.innerHTML=[['Días naturales del periodo (incluidos inicio y fin)',String(days)],['Vacaciones anuales asignadas',annual[shift]+' días'],['Vacaciones generadas',fmt(accrued)+' días'],['Redondeo del periodo',rounded+' días'],['Vacaciones disfrutadas',taken+' días'],['Resto del periodo',remaining+' días']].map(([a,b])=>`<div class="row"><span>${a}</span><b>${b}</b></div>`).join('');
 return {valid:true,accrued,taken,rounded,remaining,shift,start,end,days};
}
function calculate(){
 const data=cards().map(periodData), valid=data.length>0&&data.every(x=>x.valid);
 const accrued=data.reduce((s,x)=>s+x.accrued,0),taken=data.reduce((s,x)=>s+x.taken,0),rounded=Math.round(accrued),remaining=Math.round(accrued-taken);
 $('totalEarned').textContent=fmt(accrued)+' días';$('totalRounded').textContent=rounded+' días';$('totalTaken').textContent=taken+' días';$('totalRest').textContent=valid?remaining+' días':'Revisa las fechas';
 $('summary').innerHTML=[['Periodos incluidos',String(data.length)],['Vacaciones generadas (suma de periodos)',fmt(accrued)+' días'],['Vacaciones redondeadas del total',rounded+' días'],['Días disfrutados (suma de periodos)',taken+' días'],['RESTO PENDIENTE TOTAL',valid?remaining+' días':'No disponible hasta corregir las fechas']].map(([a,b])=>`<div class="row"><span>${a}</span><b>${b}</b></div>`).join('');
}
function addPeriod(){
 $('periods').insertAdjacentHTML('beforeend',makePeriod());
 const card=cards().at(-1);setDateLimits(card);bindCard(card);renumber();calculate();
}
function bindCard(card){
 const start=card.querySelector('[data-field="start"]');
 start.addEventListener('change',()=>{setDateLimits(card);calculate();});
 card.querySelectorAll('input,select').forEach(el=>{el.addEventListener('input',calculate);el.addEventListener('change',calculate);});
 card.querySelector('[data-remove]').addEventListener('click',()=>{if(cards().length<=1)return;card.remove();renumber();calculate();});
}
$('addPeriod').addEventListener('click',addPeriod);
addPeriod();
