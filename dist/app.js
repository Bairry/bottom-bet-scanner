const state={day:'today',bottom:3,league:'all',venue:'all',data:null};
const $=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const relativeDay=iso=>{const d=new Date(iso),n=new Date();n.setHours(0,0,0,0);d.setHours(0,0,0,0);return Math.round((d-n)/86400000)};
const formatTime=iso=>new Intl.DateTimeFormat('fr-FR',{weekday:'short',day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'Europe/Paris'}).format(new Date(iso));
function render(){
  const wanted=state.day==='today'?0:1;
  const rows=state.data.matches.filter(m=>relativeDay(m.kickoff)===wanted&&m.bottomRank<=state.bottom&&(state.league==='all'||m.league===state.league)&&(state.venue==='all'||m.venue===state.venue));
  $('#cards').replaceChildren(...rows.map(card));$('#empty').hidden=rows.length>0;$('#resultCount').textContent=rows.length;$('#matchCount').textContent=rows.length;
  const sizes=state.data.matches.map(m=>m.tableSize);$('#summaryText').textContent=sizes.length?`Équipes classées jusqu’aux ${state.bottom} dernières places.`:'Aucune rencontre dans les données actuelles.';
}
function card(m){
  const node=$('#cardTemplate').content.cloneNode(true),q=s=>node.querySelector(s);q('.league').textContent=m.league;q('time').dateTime=m.kickoff;q('time').textContent=formatTime(m.kickoff);
  q('.vulnerable .rank').textContent=m.bottomRank;q('.vulnerable strong').textContent=m.bottomTeam;q('.vulnerable small').textContent=m.venue==='home'?'À domicile':'À l’extérieur';
  q('.opponent .rank').textContent=m.opponentRank;q('.opponent strong').textContent=m.opponent;q('.opponent small').textContent=`${m.opponentRank}e au classement`;q('.versus b').textContent=m.venue==='home'?'DOM.':'EXT.';
  q('.form div').innerHTML=m.form.map(x=>`<i class="${x.toLowerCase()}">${esc(x)}</i>`).join('');q('.score strong').textContent=m.vulnerability;q('.meter i').style.width=`${m.vulnerability}%`;return node;
}
async function init(){
  try{const r=await fetch('/data/matches.json',{cache:'no-store'});if(!r.ok)throw new Error();state.data=await r.json();
    const select=$('#league');[...new Set(state.data.matches.map(m=>m.league))].sort().forEach(x=>select.add(new Option(x,x)));
    $('#updatedAt').innerHTML=`<span>DERNIÈRE ANALYSE</span>${new Intl.DateTimeFormat('fr-FR',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Paris'}).format(new Date(state.data.generatedAt))}`;render();
  }catch{$('#cards').innerHTML='<div class="empty"><h2>Données indisponibles</h2><p>La dernière actualisation n’a pas pu être chargée.</p></div>';}
}
document.addEventListener('click',e=>{const b=e.target.closest('button[data-day],button[data-bottom]');if(!b)return;const key=b.dataset.day?'day':'bottom';state[key]=b.dataset.day||Number(b.dataset.bottom);b.parentElement.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===b));render()});
$('#league').addEventListener('change',e=>{state.league=e.target.value;render()});$('#venue').addEventListener('change',e=>{state.venue=e.target.value;render()});init();
