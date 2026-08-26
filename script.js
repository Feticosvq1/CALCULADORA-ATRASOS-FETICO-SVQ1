const concepts = [
  ["Salario base","salario"],
  ["Paga extra","extra"],
  ["Plus antigüedad","antig"],
  ["Plus Transporte","Plus Transporte"],
  ["Plus Nocturnidad","Plus Nocturnidad"],
  ["Plus Festivos","Plus Festivos"],
  ["Plus Domingo R","Plus Domingo R"],
  ["Plus Domingo NR","Plus Domingo NR"],
  ["Plus Logistica","Plus Logistica"]
];

const rows = document.getElementById("rows");
rows.innerHTML = concepts.map((c,i)=>`
<tr>
<td>${c[0]}</td>
<td><input class="qty" id="q${i}" type="number" min="0" step="0.01" value="0"></td>
<td class="fixed" id="old${i}">—</td>
<td class="fixed" id="new${i}">—</td>
<td class="diff" id="diff${i}">—</td>
</tr>`).join("");

function euro(v){return new Intl.NumberFormat("es-ES",{style:"currency",currency:"EUR"}).format(v)}
function round2(v){return Math.round((v+Number.EPSILON)*100)/100}

function unitValue(kind, time, shift, isNew){
  const D = window.CALC_DATA;
  const factor = D.shift_factor[shift] ?? 1;

  // Según el Excel original, SOLO estos conceptos son proporcionales al turno:
  // salario base, paga extra, plus antigüedad y Plus Logistica/convenio.
  // El resto de pluses mantienen la misma cuantía para todos los turnos.
  if(["salario","extra","antig"].includes(kind)){
    const base = (isNew ? D.new[time] : D.old[time])[kind];
    return base * factor;
  }

  const fixed = (isNew ? D.fixed_new[kind] : D.fixed_old[kind]);
  return kind === "Plus Logistica" ? fixed * factor : fixed;
}

document.getElementById("calc").addEventListener("click", ()=>{
  const shift=document.getElementById("turno").value;
  const time=document.getElementById("tiempo").value;
  if(!shift || !time){
    alert("Selecciona el turno y el tiempo en la empresa.");
    return;
  }

  let total=0;
  concepts.forEach((c,i)=>{
    const qty=Number(document.getElementById("q"+i).value||0);
    const before=unitValue(c[1],time,shift,false);
    const after=unitValue(c[1],time,shift,true);
    const diff=qty*(after-before);
    total+=diff;
    document.getElementById("old"+i).textContent=euro(before);
    document.getElementById("new"+i).textContent=euro(after);
    document.getElementById("diff"+i).textContent=euro(diff);
  });

  document.getElementById("total").textContent=euro(total);
  document.getElementById("result").innerHTML=`
    <div class="metric"><span>Turno</span><strong>${shift}</strong></div>
    <div class="metric"><span>Antigüedad</span><strong>${time}</strong></div>
    <div class="metric"><span>Atrasos brutos</span><strong class="big">${euro(total)}</strong></div>
  `;
  document.getElementById("resultCard").hidden=false;
});
