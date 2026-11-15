const STORE='mymoney_finance_v3', OLD='mymoney_simple_v2';
const fmt=n=>'Rp'+Math.round(Number(n)||0).toLocaleString('id-ID');
const clone=o=>JSON.parse(JSON.stringify(o));
const uid=()=>('b'+Date.now().toString(36)+Math.random().toString(36).slice(2,7));
const DEFAULT_BUDGETS=[['Infak / Sedekah',500000],['Cicilan HP',1125000],['Umi',500000],['Mifta',200000],['Aulia',100000],['Kuota',200000],['Cartridge + Liquid',300000],['Uang pasangan',500000],['Jajan berdua',800000],['Bensin kerja',400000],['Kopi / air PT',200000],['Rumah',700000]];
const weeklyDefault=(name,amount)=>/jajan/i.test(name)?{weeklyEnabled:true,weeklyAmount:Math.round(amount/4)}:/bensin/i.test(name)?{weeklyEnabled:true,weeklyAmount:Math.round(amount/4)}:{weeklyEnabled:false,weeklyAmount:0};
const makeBudget=([name,amount])=>({id:uid(),name,amount,paid:false,paymentMode:'cashless',...weeklyDefault(name,amount)});
const freshMonth=()=>({income:7500000,budgets:DEFAULT_BUDGETS.map(makeBudget),weeks:{},balances:[{name:'Rekening',amount:0},{name:'Tunai',amount:0},{name:'Di pasangan',amount:0}],submitted:false});
function normalizeMonth(m){
  m.budgets=(m.budgets||[]).map(b=>{let d=weeklyDefault(b.name||'',+b.amount||0);return {...b,id:b.id||uid(),paid:!!b.paid,paymentMode:b.paymentMode||'cashless',weeklyEnabled:typeof b.weeklyEnabled==='boolean'?b.weeklyEnabled:d.weeklyEnabled,weeklyAmount:Number.isFinite(+b.weeklyAmount)?+b.weeklyAmount:d.weeklyAmount};});
  m.weeks=m.weeks||{};
  for(const [wk,rec] of Object.entries(m.weeks)){
    if(!rec||rec.byBudget)continue;
    const j=m.budgets.find(b=>/jajan/i.test(b.name)),f=m.budgets.find(b=>/bensin/i.test(b.name));
    rec.byBudget={};
    if(j&&rec.together!=null)rec.byBudget[j.id]=+rec.together||0;
    if(f&&rec.fuel!=null)rec.byBudget[f.id]=+rec.fuel||0;
  }
  m.balances=m.balances||[{name:'Rekening',amount:0},{name:'Tunai',amount:0},{name:'Di pasangan',amount:0}];
  return m;
}
function loadState(){
  try{let s=JSON.parse(localStorage.getItem(STORE));if(s?.months){Object.values(s.months).forEach(normalizeMonth);return s;}
    let old=JSON.parse(localStorage.getItem(OLD));if(old?.months){let months={};for(let [k,v] of Object.entries(old.months)){months[k]=normalizeMonth({income:v.income||7500000,budgets:(v.budgets||[]).map(b=>({...b,id:uid()})),weeks:v.weeks||{},balances:v.balances||[],submitted:!!v.submitted});}return {activeMonth:old.activeMonth||'2026-11',months};}
  }catch(e){}
  return {activeMonth:'2026-11',months:{'2026-11':freshMonth()}};
}
let state=loadState(),month=state.activeMonth||'2026-11';
let week=1;
const $=id=>document.getElementById(id);
function current(){
  if(!state.months[month]){let keys=Object.keys(state.months).sort(),prev=state.months[keys[keys.length-1]]||freshMonth();let next=clone(prev);next.weeks={};next.budgets=next.budgets.map(b=>({...b,id:uid(),paid:false}));next.submitted=false;state.months[month]=next;}
  return normalizeMonth(state.months[month]);
}
function persist(){state.activeMonth=month;localStorage.setItem(STORE,JSON.stringify(state));render();}
function totalBudget(m=current()){return m.budgets.reduce((a,b)=>a+(+b.amount||0),0);}
function weeklyBudgets(m=current()){return m.budgets.filter(b=>b.weeklyEnabled&&b.weeklyAmount>0);}
function getWeeklySpent(b,rec){if(rec?.byBudget&&rec.byBudget[b.id]!=null)return +rec.byBudget[b.id]||0;if(/jajan/i.test(b.name))return +rec?.together||0;if(/bensin/i.test(b.name))return +rec?.fuel||0;return 0;}
function weekSpent(rec,m=current()){return weeklyBudgets(m).reduce((s,b)=>s+getWeeklySpent(b,rec),0);}
function weeklyActual(m){return Object.values(m.weeks||{}).reduce((s,w)=>s+weekSpent(w,m),0);}
function paidActual(m){return m.budgets.filter(b=>b.paid).reduce((a,b)=>a+(+b.amount||0),0);}
function actual(m){return paidActual(m)+weeklyActual(m);}
function monthName(k){let [y,n]=k.split('-').map(Number);return new Date(y,n-1,1).toLocaleDateString('id-ID',{month:'long',year:'numeric'});}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function render(){
  let m=current(),alloc=totalBudget(m),actualOut=actual(m),free=m.income-alloc;
  $('monthTitle').textContent=monthName(month);$('freeMoney').textContent=fmt(free);$('income').textContent=fmt(m.income);$('allocated').textContent=fmt(alloc);$('paidTotal').textContent=fmt(actualOut);$('budgetTotal').textContent=fmt(alloc);$('budgetCount').textContent=m.budgets.length+' pos';
  $('cashNeed').textContent=fmt(m.budgets.filter(b=>b.paymentMode==='cash'&&!b.paid).reduce((a,b)=>a+(+b.amount||0),0));$('budgetState').textContent=m.submitted?'✓ Anggaran disubmit':'Belum disubmit';
  $('budgetList').innerHTML=m.budgets.map(b=>`<div class="budget-row"><div class="budget-name"><span class="budget-icon">${iconFor(b.name)}</span><span><strong>${escapeHtml(b.name)}</strong><small>${b.paid?'Sudah terlaksana':'Belum terlaksana'} · ${b.paymentMode==='cash'?'Cash':'Cashless'}${b.weeklyEnabled?' · Mingguan '+fmt(b.weeklyAmount):''}</small></span></div><div class="budget-amount"><b>${fmt(b.amount)}</b><small><input class="paid-toggle" type="checkbox" aria-label="Tandai ${escapeHtml(b.name)} sudah terlaksana" ${b.paid?'checked':''} onchange="togglePaid('${b.id}',this.checked)"> ${b.paid?'Selesai':'Tandai selesai'}</small></div></div>`).join('');
  renderWeeklySections(m);
  $('balanceCards').innerHTML=m.balances.map(b=>`<div class="wallet-card"><small>${escapeHtml(b.name)}</small><b>${fmt(b.amount)}</b></div>`).join('');
  renderHistory();renderTrend();
}
function iconFor(n){let s=n.toLowerCase();if(s.includes('infak'))return '♡';if(s.includes('hp')||s.includes('cicilan'))return '▣';if(s.includes('umi')||s.includes('mifta')||s.includes('aulia')||s.includes('keluarga'))return '⌂';if(s.includes('pasangan')||s.includes('jajan'))return '♡';if(s.includes('bensin'))return '↗';if(s.includes('cartridge')||s.includes('liquid'))return '◉';if(s.includes('kuota'))return '⌁';return '◇';}
function renderWeeklySections(m){
  const enabled=weeklyBudgets(m),host=$('weeklySections');
  if(!enabled.length){host.innerHTML='<div class="weekly-empty">Belum ada anggaran mingguan yang diaktifkan. Buka <b>Edit anggaran</b>, lalu centang “Pantau sebagai anggaran mingguan” pada pos yang ingin dipantau.</div>';$('dailyStatus').textContent='Tidak aktif';$('dailySub').textContent='atur dari anggaran';$('dailyAverage').textContent='—';return;}
  host.innerHTML=enabled.map((b,i)=>weeklyCard(b,i)).join('');
  enabled.forEach(b=>{let inp=$(`weekly-${b.id}`);if(inp){inp.value=getWeeklySpent(b,m.weeks[week]);inp.addEventListener('input',updateWeeklyCard);}});
  $('dailyStatus').textContent=enabled.length+' pos aktif';$('dailySub').textContent='laporan mingguan';
  const saved=Object.keys(m.weeks).filter(k=>+k>=1&&+k<=4).length;
  $('dailyAverage').textContent=saved?fmt(Math.round(weeklyActual(m)/saved)):'—';
  updateWeeklyCard();
}
function weeklyCard(b,i){
  const rec=current().weeks[week],spent=getWeeklySpent(b,rec),left=(+b.weeklyAmount||0)-spent;
  return `<article class="weekly-card" data-budget-id="${b.id}"><div class="weekly-card-head"><div><span class="weekly-icon">${iconFor(b.name)}</span><div><b>${escapeHtml(b.name)}</b><small>Jatah ${fmt(b.weeklyAmount)} per minggu</small></div></div><label class="week-picker">Minggu <select class="weekly-select" data-week-select="${b.id}">${[1,2,3,4].map(n=>`<option value="${n}" ${week===n?'selected':''}>${n}</option>`).join('')}</select></label></div><div class="weekly-stats"><div><small>Jatah</small><b>${fmt(b.weeklyAmount)}</b></div><div><small>Terpakai</small><b class="spent-${b.id}">${fmt(spent)}</b></div><div><small>${left>=0?'Sisa':'Lebih'}</small><b class="left-${b.id}">${fmt(Math.abs(left))}</b></div></div><label class="weekly-input-label">Total pemakaian minggu ini<div class="weekly-input"><span>Rp</span><input id="weekly-${b.id}" type="number" min="0" inputmode="numeric" placeholder="Masukkan total terpakai"></div></label><div class="weekly-feedback ${left<0?'over':''}" id="feedback-${b.id}">${left>=0?'Masih tersisa '+fmt(left):'Melebihi anggaran '+fmt(-left)}</div><button class="primary-btn full save-week-btn" data-save-week="${b.id}">✓ Simpan laporan <span>→</span></button><div class="weekly-history">${[1,2,3,4].map(n=>{let v=getWeeklySpent(b,current().weeks[n]),has=!!current().weeks[n];let d=b.weeklyAmount-v;return `<div><small>W${n}</small><b class="${has?(d<0?'over-text':'good-text'):''}">${has?(d>=0?'Sisa ':'Lebih ')+fmt(Math.abs(d)):'—'}</b></div>`}).join('')}</div></article>`;
}
function updateWeeklyCard(){
  const m=current();
  weeklyBudgets(m).forEach(b=>{let input=$(`weekly-${b.id}`);if(!input)return;let spent=+input.value||0,left=(+b.weeklyAmount||0)-spent;let card=input.closest('.weekly-card');card.querySelector(`.spent-${b.id}`).textContent=fmt(spent);card.querySelector(`.left-${b.id}`).textContent=fmt(Math.abs(left));card.querySelector(`.weekly-feedback`).textContent=left>=0?'Masih tersisa '+fmt(left):'Melebihi anggaran '+fmt(-left);card.querySelector(`.weekly-feedback`).classList.toggle('over',left<0);});
}
function saveWeekly(budgetId){
  const m=current(),b=m.budgets.find(x=>x.id===budgetId),input=$(`weekly-${budgetId}`);if(!b||!input)return;
  m.weeks[week]=m.weeks[week]||{byBudget:{}};m.weeks[week].byBudget=m.weeks[week].byBudget||{};
  m.weeks[week].byBudget[budgetId]=+input.value||0;
  persist();
}
window.togglePaid=(id,v)=>{let b=current().budgets.find(x=>x.id===id);if(b)b.paid=v;persist();};
function renderHistory(){let keys=Object.keys(state.months).sort().reverse();$('monthHistory').innerHTML=keys.map(k=>{let m=state.months[k],out=actual(m),remaining=m.income-totalBudget(m);return `<div class="month-row ${k===month?'current':''}"><div><b>${monthName(k)}</b><small>Pemasukan ${fmt(m.income)} · Realisasi tercatat ${fmt(out)}</small></div><div style="text-align:right"><b>${fmt(remaining)}</b><small>Belum dialokasikan</small></div><button onclick="openMonth('${k}')">${k===month?'Aktif':'Lihat'}</button></div>`}).join('');}
window.openMonth=k=>{month=k;week=1;persist();window.scrollTo({top:0,behavior:'smooth'});};
function renderTrend(){let count=+$('trendRange').value||6,keys=Object.keys(state.months).sort().slice(-count),vals=keys.map(k=>{let m=state.months[k];return {k,alloc:totalBudget(m),actual:actual(m),free:m.income-totalBudget(m)};});if(!vals.length){$('trendChart').innerHTML='<p>Belum ada data.</p>';return;}
let max=Math.max(1,...vals.flatMap(v=>[v.alloc,v.actual,v.free])),W=620,H=175,left=8,right=8,top=12,bottom=28,innerH=H-top-bottom,step=(W-left-right)/vals.length,bw=Math.min(22,step*.22),y=v=>top+innerH-(v/max)*innerH;
let svg=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">`;for(let i=0;i<4;i++){let yy=top+i*innerH/3;svg+=`<line x1="${left}" y1="${yy}" x2="${W-right}" y2="${yy}" stroke="currentColor" opacity=".12" stroke-dasharray="3 4"/>`;}
vals.forEach((v,i)=>{let cx=left+step*i+step/2;[{v:v.alloc,c:'#243b60',dx:-bw-2},{v:v.actual,c:'#4da486',dx:0},{v:v.free,c:'#efad89',dx:bw+2}].forEach(b=>{let yy=y(b.v),hh=top+innerH-yy;svg+=`<rect x="${cx+b.dx-bw/2}" y="${yy}" width="${bw}" height="${Math.max(1,hh)}" rx="4" fill="${b.c}"/>`;});svg+=`<text x="${cx}" y="${H-8}" text-anchor="middle" font-size="10" fill="currentColor">${monthName(v.k).slice(0,3)}</text>`;});svg+='</svg>';$('trendChart').innerHTML=svg;let avg=vals.reduce((a,v)=>a+v.actual,0)/vals.length,last=vals.at(-1);$('trendSummary').innerHTML=`<div class="trend-kpi"><small>Rata-rata realisasi tercatat</small><b>${fmt(avg)}</b></div><div class="trend-kpi"><small>Belum dialokasikan bulan ini</small><b>${fmt(last.free)}</b></div>`;}
$('trendRange').onchange=renderTrend;
$('prevMonth').onclick=()=>shiftMonth(-1);$('nextMonth').onclick=()=>shiftMonth(1);
function shiftMonth(n){let [y,m]=month.split('-').map(Number),d=new Date(y,m-1+n,1);month=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;week=1;persist();}
$('newMonth').onclick=()=>{let value=prompt('Bulan baru (format YYYY-MM), contoh 2026-12');if(!value||!/^\d{4}-\d{2}$/.test(value))return;if(state.months[value]){alert('Bulan tersebut sudah ada. Silakan buka dari Riwayat bulan.');return;}let prev=clone(current());prev.weeks={};prev.budgets.forEach(b=>{b.paid=false;});prev.submitted=false;state.months[value]=prev;month=value;week=1;persist();};
function showModal(title,body,saveFn){$('modalTitle').textContent=title;$('modalBody').innerHTML=body;$('modalSave').textContent=title.startsWith('Edit anggaran')?'✓ Simpan & submit anggaran':'✓ Simpan perubahan';$('modal').showModal();$('modalSave').onclick=e=>{e.preventDefault();saveFn();$('modal').close();persist();};}
$('editBudget').onclick=()=>{let m=current();showModal('Edit anggaran '+monthName(month),`<label class="modal-field">Pemasukan bulan ini (Rp)<input id="editIncome" type="number" value="${m.income}"></label><p class="modal-help">Ubah nama, nominal, metode pembayaran, dan status pos. Untuk membuat laporan mingguan, aktifkan pemantauan mingguan dan isi jatah per minggu. Section mingguan hanya tampil untuk pos yang diaktifkan.</p><div id="editRows">${m.budgets.map(b=>budgetEditRow(b)).join('')}</div><button type="button" class="add-row" id="addBudgetRow">＋ Tambah pos anggaran</button>`,()=>{m.income=+$('editIncome').value||0;m.budgets=[...document.querySelectorAll('.edit-row')].map(row=>({id:row.dataset.id||uid(),name:row.querySelector('.edit-name').value.trim(),amount:+row.querySelector('.edit-amount').value||0,paid:row.querySelector('.edit-paid').checked,paymentMode:row.querySelector('.edit-mode:checked').value,weeklyEnabled:row.querySelector('.edit-weekly').checked,weeklyAmount:+row.querySelector('.edit-weekly-amount').value||0})).filter(b=>b.name);m.submitted=true;m.submittedAt=new Date().toISOString();});$('addBudgetRow').onclick=()=> $('editRows').insertAdjacentHTML('beforeend',budgetEditRow({id:uid(),name:'Pos baru',amount:0,paid:false,paymentMode:'cashless',weeklyEnabled:false,weeklyAmount:0}));};
function budgetEditRow(b){return `<div class="edit-row" data-id="${b.id}"><input class="edit-name" aria-label="Nama pos" value="${escapeHtml(b.name)}"><input class="edit-amount" aria-label="Nominal anggaran" type="number" value="${b.amount}"><div class="payment-choice" role="group" aria-label="Metode pembayaran"><label><input class="edit-mode" type="radio" name="mode-${b.id}" value="cash" ${b.paymentMode==='cash'?'checked':''}><span>Cash</span></label><label><input class="edit-mode" type="radio" name="mode-${b.id}" value="cashless" ${b.paymentMode!=='cash'?'checked':''}><span>Cashless</span></label></div><button type="button" aria-label="Hapus pos" onclick="this.closest('.edit-row').remove()">×</button><label class="modal-help" style="grid-column:1/-1"><input class="edit-paid" type="checkbox" ${b.paid?'checked':''}> Sudah terlaksana / dibayarkan</label><div class="weekly-config"><label><input class="edit-weekly" type="checkbox" ${b.weeklyEnabled?'checked':''}> Pantau sebagai anggaran mingguan</label><input class="edit-weekly-amount" type="number" aria-label="Jatah per minggu" placeholder="Jatah per minggu" value="${b.weeklyAmount||''}" ${b.weeklyEnabled?'':'disabled'}></div></div>`;}
$('modalBody').addEventListener('change',e=>{if(e.target.classList.contains('edit-weekly')){let row=e.target.closest('.edit-row'),amt=row.querySelector('.edit-weekly-amount');amt.disabled=!e.target.checked;if(e.target.checked&&!amt.value){let monthly=+row.querySelector('.edit-amount').value||0;amt.value=Math.round(monthly/4);}}});
$('editBalances').onclick=()=>{let m=current();showModal('Saldo aktual',`<p class="modal-help">Masukkan saldo uang yang benar-benar masih ada. Uang yang sudah diberikan kepada orang lain tidak dihitung lagi sebagai saldo Anda.</p>${m.balances.map((b,i)=>`<label class="modal-field">${escapeHtml(b.name)}<input class="balance-edit" data-index="${i}" type="number" value="${b.amount}"></label>`).join('')}`,()=>document.querySelectorAll('.balance-edit').forEach(x=>m.balances[+x.dataset.index].amount=+x.value||0));};
$('backupBtn').onclick=()=>showModal('Backup & pemulihan',`<p class="modal-help">Data tersimpan di browser ini. Buat backup secara berkala. Untuk menggunakan di iPhone dan komputer dengan data yang sama, pindahkan backup atau tambahkan sinkronisasi cloud pada tahap berikutnya.</p><button type="button" class="add-row" id="exportBackup">Unduh backup JSON</button><label class="modal-field">Pulihkan backup JSON<input id="importBackup" type="file" accept="application/json"></label>`,()=>{});
$('modalBody').addEventListener('click',e=>{if(e.target.id==='exportBackup'){let blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='budget-in-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}});
$('modalBody').addEventListener('change',async e=>{if(e.target.id==='importBackup'){try{let s=JSON.parse(await e.target.files[0].text());if(!s.months)throw Error();state=s;month=state.activeMonth||Object.keys(s.months).sort().at(-1);persist();$('modal').close();}catch{alert('File backup tidak valid.');}}});
$('dismissHint').onclick=()=>{$('installHint').remove();localStorage.setItem('budgetin_install_dismissed','1');};if(localStorage.getItem('budgetin_install_dismissed'))$('installHint').remove();
document.querySelectorAll('.bottom-nav a').forEach(a=>a.addEventListener('click',()=>{document.querySelectorAll('.bottom-nav a').forEach(x=>x.classList.remove('active'));a.classList.add('active');}));
// Delegated handlers for independently rendered weekly sections.
$('weeklySections').addEventListener('change',e=>{
  if(e.target.classList.contains('weekly-select')){
    week=+e.target.value||1;
    renderWeeklySections(current());
  }
});
$('weeklySections').addEventListener('click',e=>{
  const btn=e.target.closest('[data-save-week]');
  if(btn) saveWeekly(btn.dataset.saveWeek);
});
const THEME_KEY='mymoney_theme_v1';
function applyTheme(theme){document.documentElement.dataset.theme=theme;localStorage.setItem(THEME_KEY,theme);const icon=$('themeIcon');if(icon)icon.textContent=theme==='dark'?'☀':'☾';const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',theme==='dark'?'#0c1422':'#101f3d');}
applyTheme(localStorage.getItem(THEME_KEY)||'light');
$('themeToggle')?.addEventListener('click',()=>applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
render();
