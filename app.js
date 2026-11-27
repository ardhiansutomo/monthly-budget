const STORE='mymoney_finance_v3', OLD='mymoney_simple_v2';
const fmt=n=>'Rp'+Math.round(Number(n)||0).toLocaleString('id-ID');
const clone=o=>JSON.parse(JSON.stringify(o));
const uid=()=>('bi'+Date.now().toString(36)+Math.random().toString(36).slice(2,7));
const DEFAULT_BUDGETS=[['Kebutuhan rumah tangga',0],['Transportasi',0],['Komunikasi',0],['Makan dan minum',0],['Kesehatan',0],['Pendidikan',0],['Tagihan rutin',0],['Tabungan',0]];
function weeklyDefaults(name,amount){if(/jajan/i.test(name))return {weeklyEnabled:true,weeklyAmount:Math.round(amount/4)};if(/bensin/i.test(name))return {weeklyEnabled:true,weeklyAmount:Math.round(amount/4)};return {weeklyEnabled:false,weeklyAmount:0};}
const freshMonth=()=>({income:0,budgets:DEFAULT_BUDGETS.map(([name,amount])=>({id:uid(),name,amount,paid:false,paymentMode:'cashless',...weeklyDefaults(name,amount)})),weeks:{},balances:[{name:'Rekening',amount:0},{name:'Tunai',amount:0},{name:'Di pasangan',amount:0}],submitted:false});
function normalizeMonth(m,key=month){
 m.budgets=(m.budgets||[]).map(b=>{const d=weeklyDefaults(b.name||'',+b.amount||0);return {...b,id:b.id||uid(),paid:!!b.paid,paymentMode:b.paymentMode||'cashless',weeklyEnabled:typeof b.weeklyEnabled==='boolean'?b.weeklyEnabled:d.weeklyEnabled,weeklyAmount:Number.isFinite(+b.weeklyAmount)?+b.weeklyAmount:d.weeklyAmount};});
 m.weeks=m.weeks||{};m.status=m.status||(m.submitted?'submitted':'draft');m.submitted=m.status==='submitted';
 // Migration: retain the old calendar month for existing weekly records; new plans
 // without weekly history track the following month's actual-use calendar.
 if(!m.weeklyMonthKey){const hasLegacyActuals=Object.keys(m.weeks).length>0;m.weeklyMonthKey=hasLegacyActuals?key:nextMonthKey(key);}
 for(const rec of Object.values(m.weeks)){if(rec&&!rec.byBudget){rec.byBudget={};let j=m.budgets.find(b=>/jajan/i.test(b.name)),f=m.budgets.find(b=>/bensin/i.test(b.name));if(j&&rec.together!=null)rec.byBudget[j.id]=+rec.together||0;if(f&&rec.fuel!=null)rec.byBudget[f.id]=+rec.fuel||0;let c=m.budgets.find(b=>/kopi|air pt/i.test(b.name));if(c&&rec.work!=null){rec.byBudget[c.id]=+rec.work||0;if(+rec.work>0){c.weeklyEnabled=true;if(!c.weeklyAmount)c.weeklyAmount=50000;}}}}
 m.balances=m.balances||[{name:'Rekening',amount:0},{name:'Tunai',amount:0},{name:'Di pasangan',amount:0}];return m;
}
function weeklyMonthKey(m=current()){return m.weeklyMonthKey||nextMonthKey(month);}

function defaultPlanningMonthKey(){const now=new Date(),d=new Date(now.getFullYear(),now.getMonth()+1,1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;}
function loadState(){try{let s=JSON.parse(localStorage.getItem(STORE));if(s?.months){for(const [k,v] of Object.entries(s.months))normalizeMonth(v,k);if(!s.activeMonth||!s.months[s.activeMonth])s.activeMonth=Object.keys(s.months).sort().at(-1)||defaultPlanningMonthKey();return s;}let old=JSON.parse(localStorage.getItem(OLD));if(old?.months){let months={};for(let [k,v] of Object.entries(old.months))months[k]=normalizeMonth({income:v.income||7500000,budgets:(v.budgets||[]).map(b=>({...b,id:uid()})),weeks:v.weeks||{},balances:v.balances||[],submitted:!!v.submitted},k);return {activeMonth:old.activeMonth||Object.keys(months).sort().at(-1)||defaultPlanningMonthKey(),months};}}catch(e){}const firstMonth=defaultPlanningMonthKey(),fresh=freshMonth();fresh.weeklyMonthKey=nextMonthKey(firstMonth);return {activeMonth:firstMonth,months:{[firstMonth]:fresh}}}
let state=loadState(),month=state.activeMonth||'2026-11',week=1;
const $=id=>document.getElementById(id);
function previousMonthKey(k){let [y,n]=k.split('-').map(Number),d=new Date(y,n-2,1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;}
function current(){if(!state.months[month]){let prevKey=previousMonthKey(month),prev=state.months[prevKey];if(!prev){let keys=Object.keys(state.months).filter(k=>k<month).sort();prev=keys.length?state.months[keys[keys.length-1]]:null;}let next=prev?clone(prev):freshMonth();next.weeks={};next.weeklyMonthKey=nextMonthKey(month);next.budgets=next.budgets.map(b=>({...b,id:uid(),paid:false}));next.balances=[{name:'Rekening',amount:0},{name:'Tunai',amount:0},{name:'Di pasangan',amount:0}];next.submitted=false;next.status='draft';delete next.submittedAt;state.months[month]=next;}return normalizeMonth(state.months[month],month);}
function totalBudget(m=current()){return m.budgets.reduce((a,b)=>a+(+b.amount||0),0);}
function weeklyBudgets(m=current()){return m.budgets.filter(b=>b.weeklyEnabled&&b.weeklyAmount>0);}
function weeklyUsed(b,rec){if(rec?.byBudget&&rec.byBudget[b.id]!=null)return +rec.byBudget[b.id]||0;if(/jajan/i.test(b.name))return +rec?.together||0;if(/bensin/i.test(b.name))return +rec?.fuel||0;return 0;}
function weekSpent(rec,m=current()){
 if(!rec)return 0;
 // Count all recorded historical entries, even when weekly monitoring is later disabled.
 const values=rec.byBudget||{};
 let total=Object.entries(values).reduce((sum,[id,value])=>{
   const budget=m.budgets.find(b=>b.id===id);
   return sum+(budget?Math.max(0,Number(value)||0):0);
 },0);
 // Legacy V3.x fields are only counted when no byBudget map exists.
 if(!rec.byBudget){
   const j=m.budgets.find(b=>/jajan/i.test(b.name)),f=m.budgets.find(b=>/bensin/i.test(b.name));
   if(j)total+=Math.max(0,Number(rec.together)||0);
   if(f)total+=Math.max(0,Number(rec.fuel)||0);
   const c=m.budgets.find(b=>/kopi|air pt/i.test(b.name));
   if(c)total+=Math.max(0,Number(rec.work)||0);
 }
 return total;
}
function dailyActual(m){return Object.values(m.weeks||{}).reduce((s,w)=>s+weekSpent(w,m),0);}
function paidActual(m){return m.budgets.filter(b=>b.paid).reduce((a,b)=>a+(+b.amount||0),0);}
function actual(m){return dailyActual(m);}
function trackedDisbursedActual(m){
 return m.budgets.filter(b=>b.paid&&b.weeklyEnabled).reduce((sum,b)=>sum+Object.values(m.weeks||{}).reduce((n,rec)=>n+weeklyUsed(b,rec),0),0);
}
function trackedRemaining(m){return trackedDisbursedActual(m)-actual(m);}
function validMonthKey(k){return typeof k==='string'&&/^\d{4}-(0[1-9]|1[0-2])$/.test(k);}

function monthName(k){let [y,n]=k.split('-').map(Number);return new Date(y,n-1,1).toLocaleDateString('id-ID',{month:'long',year:'numeric'});}
function monthWeekRanges(key){
 const [year,monthNo]=key.split('-').map(Number),first=new Date(year,monthNo-1,1),last=new Date(year,monthNo,0),ranges=[];
 let cursor=new Date(first);
 while(cursor<=last){let end=new Date(cursor);end.setDate(end.getDate()+(7-end.getDay())%7);if(end>last)end=new Date(last);ranges.push({start:new Date(cursor),end:new Date(end)});cursor=new Date(end);cursor.setDate(cursor.getDate()+1);}
 return ranges;
}
function dateRangeLabel(r){const f=d=>d.toLocaleDateString('id-ID',{day:'numeric',month:'short'});return f(r.start)+'–'+f(r.end);}
function ensureWeeklyAllocation(m){
 const count=monthWeekRanges(weeklyMonthKey(m)).length;
 m.budgets.forEach(b=>{if(b.weeklyEnabled)b.weeklyAmount=Math.round((Number(b.amount)||0)/count);});
 m.weekCount=count;return count;
}
function nextMonthKey(key){const [y,n]=key.split('-').map(Number),d=new Date(y,n,1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');}

function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function iconFor(n){let s=n.toLowerCase();if(s.includes('infak'))return 'volunteer_activism';if(s.includes('hp')||s.includes('cicilan'))return 'smartphone';if(s.includes('umi')||s.includes('mifta')||s.includes('aulia')||s.includes('keluarga'))return 'family_restroom';if(s.includes('pasangan')||s.includes('jajan'))return 'favorite';if(s.includes('bensin'))return 'local_gas_station';if(s.includes('cartridge')||s.includes('liquid'))return 'water_drop';if(s.includes('kuota'))return 'wifi';if(s.includes('kopi')||s.includes('air'))return 'coffee';if(s.includes('rumah'))return 'home';return 'category';}
function render(){
 const m=current(),alloc=totalBudget(m),out=actual(m);
 $('monthTitle').textContent=monthName(month);if($('planningCycleNote'))$('planningCycleNote').textContent='Disusun '+monthName(month)+' · dipakai '+monthName(weeklyMonthKey(m));
 const targetMonthKey=nextMonthKey(month),targetExists=!!state.months[targetMonthKey];
 $('draftNextMonth').textContent=(targetExists?'↗ Buka ':'＋ Salin ke ')+monthName(targetMonthKey).replace(/\s+\d{4}$/,'');
 $('draftNextMonth').title=targetExists?'Buka anggaran '+monthName(targetMonthKey):'Salin pemasukan, semua nama pos, nominal, metode pembayaran, dan pengaturan mingguan dari '+monthName(month)+' ke '+monthName(targetMonthKey);$('monthStatus').textContent=m.status==='submitted'?'✓ Anggaran tersimpan':'● Draft anggaran';$('monthStatus').className='month-status '+(m.status==='submitted'?'is-submitted':'is-draft');$('submitBudget').textContent=m.status==='submitted'?'✓ Sudah disubmit':'Submit anggaran';$('submitBudget').disabled=m.status==='submitted';$('freeMoney').textContent=fmt(m.income-alloc);$('income').textContent=fmt(m.income);$('allocated').textContent=fmt(alloc);$('paidTotal').textContent=fmt(paidActual(m));$('budgetTotal').textContent=fmt(alloc);$('budgetCount').textContent=m.budgets.length+' pos';
 $('cashNeed').textContent=fmt(m.budgets.filter(b=>b.paymentMode==='cash'&&!b.paid).reduce((a,b)=>a+(+b.amount||0),0));$('budgetState').textContent=m.submitted?'✓ Anggaran tersimpan':'Belum disubmit';
 $('budgetList').innerHTML=m.budgets.map(b=>`<div class="budget-row"><div class="budget-name"><span class="budget-icon material-symbols-rounded">${iconFor(b.name)}</span><span><strong>${escapeHtml(b.name)}</strong><small>${b.paid?'Sudah terlaksana':'Belum terlaksana'} · ${b.paymentMode==='cash'?'Cash':'Cashless'}${b.weeklyEnabled?' · Mingguan '+fmt(b.weeklyAmount):''}</small></span></div><div class="budget-amount"><b>${fmt(b.amount)}</b><small><input class="paid-toggle" type="checkbox" aria-label="Tandai ${escapeHtml(b.name)} sudah terlaksana" ${b.paid?'checked':''} onchange="togglePaid('${b.id}',this.checked)"> ${b.paid?'Selesai':'Tandai selesai'}</small></div></div>`).join('');
 renderWeeklySections(m);
 $('balanceCards').innerHTML=m.balances.map(b=>`<div class="wallet-card"><small>${escapeHtml(b.name)}</small><b>${fmt(b.amount)}</b></div>`).join('');
 renderHistory();renderTrend();
}
function renderWeeklySections(m){
 const useMonth=weeklyMonthKey(m),enabled=weeklyBudgets(m),host=$('weeklySections'),ranges=monthWeekRanges(useMonth);
 if(week>ranges.length)week=ranges.length;
 if(!enabled.length){host.innerHTML='<div class="weekly-empty">Belum ada anggaran mingguan aktif. Buka Edit anggaran, lalu aktifkan pemantauan mingguan pada pos yang ingin dipantau.</div>';$('dailyStatus').textContent='Tidak aktif';$('dailySub').textContent='atur di anggaran';$('dailyAverage').textContent='—';return;}
 host.innerHTML=`<div class="weekly-calendar"><div><b>Pemakaian ${monthName(useMonth)} · ${ranges.length} periode monitoring</b><small>Anggaran ${monthName(month)} digunakan untuk mencatat aktual pada bulan ${monthName(useMonth)}.</small></div><div class="calendar-chips">${ranges.map((r,i)=>`<button type="button" class="calendar-chip ${week===i+1?'active':''}" data-calendar-week="${i+1}"><b>W${i+1}</b><small>${dateRangeLabel(r)}</small></button>`).join('')}</div></div>`+enabled.map(b=>weeklyCard(b)).join('');
 enabled.forEach(b=>{let input=$('weekly-'+b.id);if(input){input.value=weeklyUsed(b,m.weeks[week]);input.addEventListener('input',updateWeeklyCards);}});
 $('dailyStatus').textContent=enabled.length+' pos aktif';$('dailySub').textContent='laporan mingguan';
 let saved=Object.keys(m.weeks).filter(k=>+k>=1&&+k<=monthWeekRanges(useMonth).length).length;$('dailyAverage').textContent=saved?fmt(Math.round(dailyActual(m)/saved)):'—';
 updateWeeklyCards();
}
function weeklyCard(b){
 const m=current(),useMonth=weeklyMonthKey(m),rec=m.weeks[week],spent=weeklyUsed(b,rec),left=b.weeklyAmount-spent,ranges=monthWeekRanges(useMonth);
 return `<article class="weekly-card"><div class="weekly-card-head"><div><span class="weekly-icon material-symbols-rounded">${iconFor(b.name)}</span><span><b>${escapeHtml(b.name)}</b><small>Jatah ${fmt(b.weeklyAmount)} / minggu</small></span></div><span class="week-picker">Minggu <select class="weekly-select" data-week-select="${b.id}">${ranges.map((r,i)=>`<option value="${i+1}" ${week===i+1?'selected':''}>W${i+1} · ${dateRangeLabel(r)}</option>`).join('')}</select></span></div><div class="weekly-stats"><div><small>Jatah</small><b>${fmt(b.weeklyAmount)}</b></div><div><small>Terpakai</small><b class="spent-value">${fmt(spent)}</b></div><div><small>${left>=0?'Sisa':'Lebih'}</small><b class="left-value">${fmt(Math.abs(left))}</b></div></div><label class="weekly-input-label">Total pemakaian minggu ini<div class="weekly-input"><span>Rp</span><input id="weekly-${b.id}" type="number" min="0" inputmode="numeric" placeholder="Masukkan total terpakai"></div></label><div class="weekly-feedback ${left<0?'over':''}">${left>=0?'Masih tersisa '+fmt(left):'Melebihi anggaran '+fmt(-left)}</div><button class="primary-btn full" data-save-week="${b.id}">✓ Simpan laporan minggu <span>→</span></button><div class="weekly-history">${ranges.map((r,i)=>{let n=i+1,x=current().weeks[n],v=weeklyUsed(b,x),d=b.weeklyAmount-v;return `<div><small>W${n} · ${dateRangeLabel(r)}</small><b class="${x?(d<0?'over-text':'good-text'):''}">${x?(d>=0?'Sisa ':'Lebih ')+fmt(Math.abs(d)):'—'}</b></div>`}).join('')}</div></article>`;
}
function updateWeeklyCards(){weeklyBudgets().forEach(b=>{let input=$('weekly-'+b.id);if(!input)return;let card=input.closest('.weekly-card'),spent=+input.value||0,left=b.weeklyAmount-spent;card.querySelector('.spent-value').textContent=fmt(spent);card.querySelector('.left-value').textContent=fmt(Math.abs(left));let fb=card.querySelector('.weekly-feedback');fb.textContent=left>=0?'Masih tersisa '+fmt(left):'Melebihi anggaran '+fmt(-left);fb.classList.toggle('over',left<0);});}
function saveWeekly(id){let m=current(),b=m.budgets.find(x=>x.id===id),input=$('weekly-'+id);if(!b||!input)return;m.weeklyMonthKey=weeklyMonthKey(m);m.weeks[week]=m.weeks[week]||{byBudget:{}};m.weeks[week].byBudget=m.weeks[week].byBudget||{};m.weeks[week].byBudget[id]=+input.value||0;persist();}
$('weeklySections').addEventListener('change',e=>{if(e.target.matches('.weekly-select')){week=+e.target.value||1;renderWeeklySections(current());}});
$('weeklySections').addEventListener('click',e=>{let cal=e.target.closest('[data-calendar-week]');if(cal){week=+cal.dataset.calendarWeek||1;renderWeeklySections(current());return;}let btn=e.target.closest('[data-save-week]');if(btn)saveWeekly(btn.dataset.saveWeek);});
window.togglePaid=(id,v)=>{let b=current().budgets.find(x=>x.id===id);if(b)b.paid=v;persist();};
function renderHistory(){let keys=Object.keys(state.months).sort().reverse();$('monthHistory').innerHTML=keys.map(k=>{let m=state.months[k];return `<div class="month-row ${k===month?'current':''}"><div><b>${monthName(k)}</b><small>Rencana ${monthName(k)} → aktual ${monthName(m.weeklyMonthKey||nextMonthKey(k))} · ${fmt(actual(m))}</small></div><div style="text-align:right"><b>${fmt(m.income-totalBudget(m))}</b><small>Belum dialokasikan</small></div><button onclick="openMonth('${k}')">${k===month?'Aktif':'Lihat'}</button></div>`}).join('');}
window.openMonth=k=>{month=k;week=1;persist();window.scrollTo({top:0,behavior:'smooth'});};
function renderTrend(){
 const count=+$('trendRange').value||6;
 const keys=Object.keys(state.months).sort().slice(-count);
 const vals=keys.map(k=>{const m=state.months[k],alloc=totalBudget(m),spent=actual(m),income=+m.income||0;return {k,useKey:m.weeklyMonthKey||nextMonthKey(k),alloc,actual:spent,free:income-alloc,util:alloc>0?spent/alloc*100:0};});
 const host=$('trendChart');
 if(!vals.length){host.innerHTML='<div class="chart-empty"><span class="material-symbols-rounded">query_stats</span><b>Belum ada data tren</b><small>Submit anggaran dan catat aktual mingguan untuk melihat perkembangan.</small></div>';$('trendSummary').innerHTML='';return;}
 const W=900,H=330,L=76,R=58,T=24,B=58,plotW=W-L-R,plotH=H-T-B;
 const maxMoney=Math.max(1,...vals.flatMap(v=>[v.alloc,v.actual]));
 const axisMax=Math.ceil(maxMoney/4/100000)*100000*4||maxMoney;
 const yMoney=v=>T+plotH-(Math.max(0,v)/axisMax)*plotH;
 const yPct=v=>T+plotH-(Math.min(150,Math.max(0,v))/150)*plotH;
 const groupW=plotW/vals.length,barW=Math.min(23,Math.max(8,groupW*.22));
 const moneyLabel=v=>new Intl.NumberFormat('id-ID',{notation:'compact',maximumFractionDigits:1}).format(v);
 let svg=`<svg class="trend-svg trend-bars" viewBox="0 0 ${W} ${H}" role="img" aria-label="Grafik batang anggaran dan aktual mingguan dengan garis persentase pemakaian untuk ${vals.length} rencana bulanan"><defs><linearGradient id="planBar" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#4d8fe8"/><stop offset="100%" stop-color="#2464b7"/></linearGradient><linearGradient id="actualBar" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#45c5a1"/><stop offset="100%" stop-color="#168b76"/></linearGradient><linearGradient id="chartGlow" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stop-color="#4d8fe8" stop-opacity=".12"/><stop offset="100%" stop-color="#4d8fe8" stop-opacity="0"/></linearGradient></defs>`;
 for(let i=0;i<=4;i++){
  const value=axisMax*i/4,yy=yMoney(value);
  svg+=`<line x1="${L}" y1="${yy}" x2="${W-R}" y2="${yy}" class="chart-gridline"/><text x="${L-12}" y="${yy+4}" text-anchor="end" class="chart-axis-label">${escapeHtml(moneyLabel(value))}</text>`;
  svg+=`<text x="${W-R+12}" y="${yy+4}" text-anchor="start" class="chart-axis-label">${i*37.5}%</text>`;
 }
 const points=[];
 vals.forEach((v,i)=>{
  const cx=L+groupW*(i+.5),x1=cx-barW-3,x2=cx+3;
  const h1=Math.max(0,T+plotH-yMoney(v.alloc)),h2=Math.max(0,T+plotH-yMoney(v.actual));
  const title=`Rencana ${monthName(v.k)} · Aktual ${monthName(v.useKey)} | Anggaran ${fmt(v.alloc)} | Aktual ${fmt(v.actual)} | Pemakaian ${v.util.toFixed(1)}%`;
  svg+=`<rect x="${x1}" y="${yMoney(v.alloc)}" width="${barW}" height="${h1}" rx="7" fill="url(#planBar)" opacity=".95"><title>${escapeHtml(title)}</title></rect>`;
  svg+=`<rect x="${x2}" y="${yMoney(v.actual)}" width="${barW}" height="${h2}" rx="7" fill="url(#actualBar)" opacity=".98"><title>${escapeHtml(title)}</title></rect>`;
  const py=yPct(v.util);points.push(`${cx},${py}`);
  const labelPlan=monthName(v.k).split(' ')[0].slice(0,3),labelUse=monthName(v.useKey).split(' ')[0].slice(0,3);
  svg+=`<text x="${cx}" y="${H-28}" text-anchor="middle" class="chart-month-label">${escapeHtml(labelPlan)}→${escapeHtml(labelUse)}</text>`;
 });
 if(vals.length>1)svg+=`<polyline points="${points.join(' ')}" fill="none" stroke="#e59a58" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`;
 vals.forEach((v,i)=>{const cx=L+groupW*(i+.5),py=yPct(v.util);svg+=`<circle cx="${cx}" cy="${py}" r="5.5" fill="#e59a58" stroke="var(--surface)" stroke-width="3"><title>${escapeHtml('Pemakaian '+monthName(v.k)+' untuk '+monthName(v.useKey)+': '+v.util.toFixed(1)+'%')}</title></circle>`;});
 svg+='</svg>';host.innerHTML=svg;
 const totalAlloc=vals.reduce((s,v)=>s+v.alloc,0),totalActual=vals.reduce((s,v)=>s+v.actual,0),avgUtil=totalAlloc?totalActual/totalAlloc*100:0,last=vals[vals.length-1];
 const delta=vals.length>1?last.actual-vals[vals.length-2].actual:null;
 const deltaText=delta===null?'Butuh data rencana lain':`${delta>0?'+':delta<0?'−':''}${fmt(Math.abs(delta))} dibanding aktual periode sebelumnya`;
 $('trendSummary').innerHTML=`
  <div class="trend-kpi"><small>Total anggaran</small><b>${fmt(totalAlloc)}</b><em>Akumulasi ${vals.length} rencana</em></div>
  <div class="trend-kpi"><small>Total aktual mingguan</small><b>${fmt(totalActual)}</b><em>${escapeHtml(deltaText)}</em></div>
  <div class="trend-kpi"><small>Rasio pemakaian</small><b>${avgUtil.toFixed(1)}%</b><em>Aktual dibanding anggaran</em></div>`;
}
$('trendRange').onchange=renderTrend;
$('prevMonth').onclick=()=>shiftMonth(-1);$('nextMonth').onclick=()=>shiftMonth(1);
function shiftMonth(n){let [y,m]=month.split('-').map(Number),d=new Date(y,m-1+n,1);month=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;week=1;persist();}

function createNextMonthDraft(){
 const sourceKey=month,source=current(),targetKey=nextMonthKey(sourceKey);
 if(state.months[targetKey]){
  if(confirm('Anggaran '+monthName(targetKey)+' sudah tersedia. Buka anggaran tersebut tanpa menimpa data yang ada?')){
   month=targetKey;week=1;persist();window.scrollTo({top:0,behavior:'smooth'});
  }
  return;
 }
 // Copy the planning inputs (including monthly income, category names/amounts,
 // payment modes and monitoring preferences) into the following use-month.
 const copied=clone(source);
 copied.budgets=copied.budgets.map(b=>({...b,id:uid(),paid:false}));
 copied.weeks={};copied.weeklyMonthKey=nextMonthKey(targetKey);
 copied.balances=(source.balances||[]).map(b=>({...b,amount:0}));
 copied.submitted=false;copied.status='draft';copied.budgetPeriod=targetKey;copied.copiedFromMonth=sourceKey;
 delete copied.submittedAt;
 const count=monthWeekRanges(copied.weeklyMonthKey).length;
 copied.budgets.forEach(b=>{if(b.weeklyEnabled)b.weeklyAmount=Math.round((Number(b.amount)||0)/count);});
 copied.weekCount=count;
 state.months[targetKey]=copied;month=targetKey;week=1;persist();
 alert('Anggaran '+monthName(targetKey)+' berhasil disiapkan dari '+monthName(sourceKey)+'. Seluruh pemasukan dan nominal pos disalin. Metode pembayaran serta pengaturan monitoring mingguan dipertahankan. Checklist, catatan pengeluaran mingguan, dan saldo aktual direset.');
}
$('newMonth').onclick=()=>{let v=prompt('Bulan baru (format YYYY-MM), contoh 2026-12');if(!v||!/^\d{4}-\d{2}$/.test(v))return;if(state.months[v]){alert('Bulan sudah ada. Buka melalui Riwayat.');return;}let prev=clone(current());prev.weeks={};prev.weeklyMonthKey=nextMonthKey(v);prev.budgets.forEach(b=>{b.id=uid();b.paid=false;});prev.submitted=false;prev.status='draft';delete prev.submittedAt;prev.balances=[{name:'Rekening',amount:0},{name:'Tunai',amount:0},{name:'Di pasangan',amount:0}];state.months[v]=prev;month=v;week=1;persist();};
$('draftNextMonth')?.addEventListener('click',createNextMonthDraft);
function showModal(title,body,saveFn){$('modalTitle').textContent=title;$('modalBody').innerHTML=body;$('modalSave').textContent=title.startsWith('Edit anggaran')?'✓ Simpan & submit anggaran':'✓ Simpan perubahan';$('modal').showModal();$('modalSave').onclick=e=>{e.preventDefault();saveFn();$('modal').close();persist();};}
$('editBudget').onclick=()=>{let m=current();showModal('Edit anggaran '+monthName(month),`<label class="modal-field">Pemasukan untuk rencana ${monthName(month)} (Rp)<input id="editIncome" type="number" value="${m.income}"></label><p class="modal-help">Rencana ${monthName(month)} akan dipakai pada ${monthName(weeklyMonthKey(m))}. Ubah nama, nominal, metode Cash/Cashless, dan aktifkan monitoring untuk pos yang ingin dicatat per minggu.</p><div id="editRows">${m.budgets.map(b=>budgetEditRow(b)).join('')}</div><button type="button" class="add-row" id="addBudgetRow">＋ Tambah pos anggaran</button>`,()=>{m.income=+$('editIncome').value||0;m.budgets=[...document.querySelectorAll('.edit-row')].map(row=>({id:row.dataset.id||uid(),name:row.querySelector('.edit-name').value.trim(),amount:+row.querySelector('.edit-amount').value||0,paid:row.querySelector('.edit-paid').checked,paymentMode:row.querySelector('.edit-mode:checked').value,weeklyEnabled:row.querySelector('.edit-weekly').checked,weeklyAmount:+row.querySelector('.edit-weekly-amount').value||0})).filter(b=>b.name);m.submitted=m.status==='submitted';if(m.submitted)m.submittedAt=m.submittedAt||new Date().toISOString();ensureWeeklyAllocation(m);});$('addBudgetRow').onclick=()=> $('editRows').insertAdjacentHTML('beforeend',budgetEditRow({id:uid(),name:'Pos baru',amount:0,paid:false,paymentMode:'cashless',weeklyEnabled:false,weeklyAmount:0}));};
function budgetEditRow(b){return `<div class="edit-row" data-id="${b.id}"><input class="edit-name" aria-label="Nama pos" value="${escapeHtml(b.name)}"><input class="edit-amount" aria-label="Nominal pos" type="number" value="${b.amount}"><div class="payment-choice"><label><input class="edit-mode" type="radio" name="mode-${b.id}" value="cash" ${b.paymentMode==='cash'?'checked':''}><span>☑ Cash</span></label><label><input class="edit-mode" type="radio" name="mode-${b.id}" value="cashless" ${b.paymentMode!=='cash'?'checked':''}><span>☑ Cashless</span></label></div><button type="button" aria-label="Hapus pos" onclick="this.closest('.edit-row').remove()">×</button><label class="modal-help" style="grid-column:1/-1"><input class="edit-paid" type="checkbox" ${b.paid?'checked':''}> Sudah terlaksana / dibayarkan</label><div class="weekly-config"><label><input class="edit-weekly" type="checkbox" ${b.weeklyEnabled?'checked':''}> Pantau sebagai anggaran mingguan</label><input class="edit-weekly-amount" type="number" aria-label="Jatah per minggu" placeholder="Jatah per minggu" value="${b.weeklyAmount||''}" ${b.weeklyEnabled?'':'disabled'}></div></div>`;}
$('modalBody').addEventListener('change',e=>{if(e.target.classList.contains('edit-weekly')){let row=e.target.closest('.edit-row'),amt=row.querySelector('.edit-weekly-amount');amt.disabled=!e.target.checked;if(e.target.checked&&!amt.value)amt.value=Math.round((+row.querySelector('.edit-amount').value||0)/4);}});
$('editBalances').onclick=()=>{let m=current();showModal('Saldo aktual',`<p class="modal-help">Isi uang yang benar-benar masih tersedia. Uang yang sudah diberikan tidak lagi dihitung sebagai saldo Anda.</p>${m.balances.map((b,i)=>`<label class="modal-field">${escapeHtml(b.name)}<input class="balance-edit" data-index="${i}" type="number" value="${b.amount}"></label>`).join('')}`,()=>document.querySelectorAll('.balance-edit').forEach(x=>m.balances[+x.dataset.index].amount=+x.value||0));};
$('backupBtn').onclick=()=>showModal('Backup & pemulihan',`<p class="modal-help">Data tersimpan di browser. Buat backup berkala. Untuk menggunakan data yang sama di beberapa perangkat, dibutuhkan sinkronisasi cloud.</p><button type="button" class="add-row" id="exportBackup">Unduh backup JSON</button><label class="modal-field">Pulihkan backup JSON<input id="importBackup" type="file" accept="application/json"></label>`,()=>{});
$('modalBody').addEventListener('click',e=>{if(e.target.id==='exportBackup'){let blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='budget-in-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}});
$('modalBody').addEventListener('change',async e=>{
 if(e.target.id!=='importBackup'||!e.target.files?.[0])return;
 const file=e.target.files[0];
 try{
  if(file.size>10*1024*1024)throw new Error('Ukuran backup melebihi batas 10 MB.');
  const candidate=JSON.parse(await file.text());
  if(!candidate||typeof candidate!=='object'||!candidate.months||typeof candidate.months!=='object'||Array.isArray(candidate.months))throw new Error('Struktur backup tidak dikenali.');
  const entries=Object.entries(candidate.months);
  if(!entries.length)throw new Error('Backup tidak berisi data bulan.');
  for(const [key,value] of entries){
   if(!validMonthKey(key)||!value||typeof value!=='object'||!Array.isArray(value.budgets))throw new Error('Data bulan atau daftar anggaran tidak valid: '+key);
   for(const b of value.budgets){
    if(!b||typeof b.name!=='string'||!Number.isFinite(Number(b.amount))||Number(b.amount)<0)throw new Error('Ditemukan pos anggaran yang tidak valid pada '+key+'.');
   }
   normalizeMonth(value,key);
  }
  const active=candidate.activeMonth&&candidate.months[candidate.activeMonth]?candidate.activeMonth:entries.map(x=>x[0]).sort().at(-1);
  if(!confirm('Pulihkan '+entries.length+' bulan dari backup? Data lokal saat ini akan diganti. Sebelum melanjutkan, aplikasi akan mengunduh backup kondisi sekarang.'))return;
  // Download a safety snapshot before mutating any state.
  const safetyBlob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});
  const safetyUrl=URL.createObjectURL(safetyBlob),safetyLink=document.createElement('a');
  safetyLink.href=safetyUrl;safetyLink.download='budget-in-pre-restore-'+new Date().toISOString().slice(0,10)+'.json';safetyLink.click();
  setTimeout(()=>URL.revokeObjectURL(safetyUrl),1500);
  const nextState={activeMonth:active,months:candidate.months};
  for(const [key,value] of Object.entries(nextState.months))normalizeMonth(value,key);
  if(supabaseClient&&cloudReady){
   setSync('Memulihkan cloud…','busy');
   for(const [key,value] of Object.entries(nextState.months))await cloudSaveMonth(key,value);
  }
  state=nextState;month=active;week=1;
  localStorage.setItem(STORE,JSON.stringify(state));
  render();$('modal').close();
  setSync(supabaseClient&&cloudReady?'Tersinkron':'Dipulihkan lokal',supabaseClient&&cloudReady?'ok':'');
  alert('Pemulihan selesai. '+entries.length+' bulan telah dipulihkan'+(supabaseClient&&cloudReady?' ke cloud.': ' pada perangkat ini.'));
 }catch(err){console.error('Backup restore failed',err);alert('Backup tidak dapat dipulihkan: '+(err.message||'File tidak valid.'));}
});
$('dismissHint').onclick=()=>{$('installHint').remove();localStorage.setItem('budgetin_install_dismissed','1');};if(localStorage.getItem('budgetin_install_dismissed'))$('installHint').remove();
if(window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true){$('installHint')?.remove();}
document.querySelectorAll('.bottom-nav a').forEach(a=>a.addEventListener('click',()=>{document.querySelectorAll('.bottom-nav a').forEach(x=>x.classList.remove('active'));a.classList.add('active');}));
const THEME_KEY='mymoney_theme_v1';function applyTheme(t){document.documentElement.dataset.theme=t;localStorage.setItem(THEME_KEY,t);let icon=$('themeIcon');if(icon)icon.textContent=t==='dark'?'light_mode':'dark_mode';let meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=t==='dark'?'#071426':'#10264a';}
applyTheme(localStorage.getItem(THEME_KEY)||'light');$('themeToggle')?.addEventListener('click',()=>applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));

// ── Budget-in V3.5: Supabase authentication and cloud persistence ──
const BI_CONFIG=window.BUDGETIN_SUPABASE||{};
let supabaseClient=null,authMode='signin',cloudReady=false,saveQueue=Promise.resolve();
let realtimeChannel=null,cloudRefreshInFlight=false,lastCloudRefreshAt=0,realtimeRefreshTimer=null;
const monthMutationVersion=new Map();
const setSync=(label,kind='')=>{const el=$('syncStatus');if(el){el.textContent=label;el.className='sync-status '+kind;}};
function showAuth(message=''){const gate=$('authGate');if(gate){gate.hidden=false;$('appShell').classList.add('app-locked');$('authMessage').textContent=message;}}
function hideAuth(){const gate=$('authGate');if(gate){gate.hidden=true;$('appShell').classList.remove('app-locked');}}
let recoveryMode=false;
function setAuthMode(mode){authMode=mode;$('authTitle').textContent=mode==='signup'?'Buat akun Budget-in':'Masuk ke Budget-in';$('authSubmit').textContent=mode==='signup'?'Daftar':'Masuk';$('authSwitch').textContent=mode==='signup'?'Sudah punya akun? Masuk':'Belum punya akun? Daftar';$('authPassword').autocomplete=mode==='signup'?'new-password':'current-password';$('forgotPassword').hidden=mode!=='signin';$('loginPasswordLabel').hidden=false;$('authForm').hidden=false;$('recoveryForm').hidden=true;$('authSwitch').hidden=false;} 
function showRecoveryForm(message='Tautan pemulihan diterima. Silakan buat password baru.'){recoveryMode=true;$('authTitle').textContent='Atur ulang password';$('authForm').hidden=true;$('authSwitch').hidden=true;$('recoveryForm').hidden=false;$('authMessage').textContent=message;showAuth(message);}
function clearRecoveryUrl(){history.replaceState({},document.title,location.pathname);}

async function cloudSaveMonth(k,m){
 if(!supabaseClient)return;
 const payload={user_id:(await supabaseClient.auth.getUser()).data.user.id,month_key:k,status:m.status||(m.submitted?'submitted':'draft'),data:m,submitted_at:m.submittedAt||null,updated_at:new Date().toISOString()};
 const {error}=await supabaseClient.from('monthly_budgets').upsert(payload,{onConflict:'user_id,month_key'});
 if(error)throw error;
}
async function syncAllMonths(){
 if(!supabaseClient)return;
 setSync('Menyinkronkan…','busy');
 const {data:authData}=await supabaseClient.auth.getUser();const user=authData?.user;if(!user)return;
 const {data:rows,error}=await supabaseClient.from('monthly_budgets').select('month_key,status,data,submitted_at,updated_at').eq('user_id',user.id).order('month_key');
 if(error)throw error;
 const local=loadState(),remoteKeys=new Set((rows||[]).map(r=>r.month_key));
 if(!rows?.length){
   // First login: import all existing V3.4 local months to the authenticated account.
   for(const [k,m] of Object.entries(local.months||{})){m.status=m.status||(m.submitted?'submitted':'draft');await cloudSaveMonth(k,m);}
 }else{
   // Cloud is canonical; import only local months that do not yet exist remotely.
   for(const r of rows||[]){state.months[r.month_key]=normalizeMonth({...r.data,status:r.status,submitted:r.status==='submitted',submittedAt:r.submitted_at||r.data?.submittedAt},r.month_key);}
   for(const [k,m] of Object.entries(local.months||{})){if(!remoteKeys.has(k)){state.months[k]=normalizeMonth(m,k);await cloudSaveMonth(k,state.months[k]);}}
 }
 const keys=Object.keys(state.months).sort();month=state.months[local.activeMonth]?local.activeMonth:(keys[keys.length-1]||month);
 state.activeMonth=month;localStorage.setItem(STORE,JSON.stringify(state));cloudReady=true;lastCloudRefreshAt=Date.now();render();setSync('Tersinkron','ok');hideAuth();await connectRealtime();
}
function persist(){
 // Local-first UI: update the screen immediately without a page reload.
 current();state.activeMonth=month;localStorage.setItem(STORE,JSON.stringify(state));render();
 monthMutationVersion.set(month,(monthMutationVersion.get(month)||0)+1);
 if(supabaseClient&&cloudReady){const k=month,m=clone(current());saveQueue=saveQueue.then(()=>cloudSaveMonth(k,m)).then(()=>setSync('Tersinkron','ok')).catch(e=>{console.error('Cloud save failed',e);setSync('Gagal sinkron','error');});setSync('Menyimpan…','busy');}
}

async function refreshCloudData({silent=false}={}){
 if(cloudRefreshInFlight)return;
 if(!supabaseClient||!cloudReady){render();localStorage.setItem(STORE,JSON.stringify(state));if(!silent)setSync('Data lokal diperbarui','ok');return;}
 cloudRefreshInFlight=true;
 const button=$('refreshBtn'),icon=$('refreshIcon');
 if(button){button.disabled=true;button.setAttribute('aria-busy','true');}
 if(icon)icon.classList.add('is-refreshing');
 if(!silent)setSync('Memuat data…','busy');
 try{
  // Wait for local edits to finish uploading before pulling the cloud snapshot.
  await saveQueue;
  const versionSnapshot=new Map(monthMutationVersion);
  const {data:authData,error:authError}=await supabaseClient.auth.getUser();
  if(authError)throw authError;
  const user=authData?.user;if(!user)throw new Error('Sesi akun tidak ditemukan. Silakan login kembali.');
  const {data:rows,error}=await supabaseClient.from('monthly_budgets').select('month_key,status,data,submitted_at,updated_at').eq('user_id',user.id).order('month_key');
  if(error)throw error;
  const remoteKeys=new Set((rows||[]).map(row=>row.month_key));
  for(const row of rows||[]){
   if(!row.month_key||!row.data)continue;
   // Do not replace a month edited while this network request was in flight.
   if((monthMutationVersion.get(row.month_key)||0)!==(versionSnapshot.get(row.month_key)||0))continue;
   state.months[row.month_key]=normalizeMonth({...row.data,status:row.status,submitted:row.status==='submitted',submittedAt:row.submitted_at||row.data?.submittedAt},row.month_key);
  }
  // Preserve local-only months; import them rather than silently deleting user data.
  for(const [key,localMonth] of Object.entries(state.months)){
   if(!remoteKeys.has(key))await cloudSaveMonth(key,localMonth);
  }
  state.activeMonth=month;
  localStorage.setItem(STORE,JSON.stringify(state));
  lastCloudRefreshAt=Date.now();
  render();setSync('Tersinkron','ok');
 }catch(error){
  console.error('Cloud refresh failed',error);
  setSync('Refresh gagal','error');
  if(!silent)alert(`Tidak dapat mengambil data terbaru dari cloud. Data lokal tetap dipertahankan.\n\n${error.message||'Periksa koneksi internet.'}`);
 }finally{
  cloudRefreshInFlight=false;
  if(button){button.disabled=false;button.removeAttribute('aria-busy');}
  if(icon)icon.classList.remove('is-refreshing');
 }
}
$('refreshBtn')?.addEventListener('click',()=>refreshCloudData());

function scheduleRealtimeRefresh(){
 if(realtimeRefreshTimer)clearTimeout(realtimeRefreshTimer);
 realtimeRefreshTimer=setTimeout(()=>refreshCloudData({silent:true}),650);
}
async function connectRealtime(){
 if(!supabaseClient||!cloudReady)return;
 try{
  const {data,error}=await supabaseClient.auth.getUser();if(error)throw error;
  const user=data?.user;if(!user)return;
  if(realtimeChannel)await supabaseClient.removeChannel(realtimeChannel);
  realtimeChannel=supabaseClient.channel('budget-in-live-'+user.id)
   .on('postgres_changes',{event:'*',schema:'public',table:'monthly_budgets',filter:'user_id=eq.'+user.id},scheduleRealtimeRefresh)
   .subscribe();
 }catch(error){console.warn('Realtime subscription unavailable; manual refresh remains available.',error);}
}
document.addEventListener('visibilitychange',()=>{
 if(document.visibilityState==='visible'&&cloudReady&&Date.now()-lastCloudRefreshAt>45000)refreshCloudData({silent:true});
});
window.addEventListener('online',()=>{if(cloudReady)refreshCloudData({silent:true});});
async function submitCurrentBudget(){
 const m=current();if(!m.budgets.length){alert('Tambahkan minimal satu pos anggaran sebelum submit.');return;}
 const total=totalBudget(m),periodCount=ensureWeeklyAllocation(m);if(total<0||m.income<0){alert('Pemasukan dan alokasi tidak boleh negatif.');return;}
 const ok=confirm(`Submit rencana anggaran ${monthName(month)} untuk pemakaian ${monthName(weeklyMonthKey(m))}?\nPeriode monitoring: ${periodCount} minggu\n\nPemasukan: ${fmt(m.income)}\nTotal alokasi: ${fmt(total)}\nSisa belum dialokasikan: ${fmt(m.income-total)}\n\nAnggaran akan disimpan ke database. Revisi berikutnya akan menimpa versi aktif bulan ini.`);
 if(!ok)return;
 m.status='submitted';m.submitted=true;m.submittedAt=new Date().toISOString();m.budgetPeriod=month;m.weekCount=periodCount;
 persist();
 if(supabaseClient&&cloudReady){try{await saveQueue;await cloudSaveMonth(month,m);setSync('Tersimpan','ok');alert('Anggaran berhasil disubmit dan disimpan.');}catch(e){m.status='draft';m.submitted=false;persist();alert('Gagal menyimpan ke database: '+e.message);}}
 else alert('Anggaran tersimpan lokal. Login dan konfigurasi Supabase diperlukan untuk penyimpanan cloud.');
}
$('submitBudget')?.addEventListener('click',submitCurrentBudget);
async function openAccountDialog(){
 if(!supabaseClient){showAuth('Koneksi akun belum tersedia.');return;}
 const {data,error}=await supabaseClient.auth.getUser();
 if(error||!data?.user){showAuth('Silakan masuk kembali ke akun Budget-in.');return;}
 $('accountEmail').textContent=data.user.email||'Akun Budget-in';
 const dark=document.documentElement.dataset.theme==='dark';
 $('accountThemeLabel').textContent=dark?'Aktifkan Light Mode':'Aktifkan Dark Mode';
 $('accountThemeIcon').textContent=dark?'light_mode':'dark_mode';
 const logout=$('accountLogoutAction');logout.dataset.confirm='no';
 logout.querySelector('b').textContent='Keluar dari akun';
 logout.querySelector('small').textContent='Logout Budget-in pada perangkat ini';
 $('accountDialog').showModal();
}
$('accountBtn')?.addEventListener('click',openAccountDialog);
$('closeAccountDialog')?.addEventListener('click',()=>$('accountDialog').close());
$('accountDialog')?.addEventListener('click',e=>{if(e.target===$('accountDialog'))$('accountDialog').close();});
$('accountThemeAction')?.addEventListener('click',()=>{
 const next=document.documentElement.dataset.theme==='dark'?'light':'dark';
 applyTheme(next);
 $('accountThemeLabel').textContent=next==='dark'?'Aktifkan Light Mode':'Aktifkan Dark Mode';
 $('accountThemeIcon').textContent=next==='dark'?'light_mode':'dark_mode';
});
$('accountBackupAction')?.addEventListener('click',()=>{$('accountDialog').close();$('backupBtn').click();});
$('accountLogoutAction')?.addEventListener('click',async()=>{
 const button=$('accountLogoutAction');
 if(button.dataset.confirm!=='yes'){
  button.dataset.confirm='yes';
  button.querySelector('b').textContent='Ketuk sekali lagi untuk keluar';
  button.querySelector('small').textContent='Konfirmasi logout dari akun ini';
  return;
 }
 button.disabled=true;
 try{
  const {error}=await supabaseClient.auth.signOut();
  if(error)throw error;
  cloudReady=false;
  setAuthMode('signin');
  $('accountDialog').close();
  setSync('Keluar');
  showAuth('Anda telah keluar. Masuk kembali untuk mengakses data cloud.');
 }catch(err){alert('Logout gagal: '+err.message);}
 finally{button.disabled=false;button.dataset.confirm='no';}
});
$('authSwitch')?.addEventListener('click',()=>setAuthMode(authMode==='signin'?'signup':'signin'));
$('forgotPassword')?.addEventListener('click',async()=>{
 if(!supabaseClient){$('authMessage').textContent='Koneksi Supabase belum tersedia.';return;}
 const email=$('authEmail').value.trim();
 if(!email){$('authMessage').textContent='Masukkan email akun Anda terlebih dahulu.';$('authEmail').focus();return;}
 $('forgotPassword').disabled=true;$('authMessage').textContent='Mengirim tautan pemulihan…';
 try{
  const redirectTo=location.origin+location.pathname+'?auth=reset';
  const {error}=await supabaseClient.auth.resetPasswordForEmail(email,{redirectTo});
  if(error)throw error;
  $('authMessage').textContent='Jika email terdaftar, tautan pemulihan telah dikirim. Periksa Inbox dan folder Spam.';
 }catch(err){$('authMessage').textContent=err.message||'Gagal mengirim email pemulihan.';}
 finally{$('forgotPassword').disabled=false;}
});
$('authForm')?.addEventListener('submit',async e=>{
 e.preventDefault();if(!supabaseClient){$('authMessage').textContent='Supabase belum dikonfigurasi. Periksa config.js.';return;}
 const email=$('authEmail').value.trim(),password=$('authPassword').value;$('authSubmit').disabled=true;$('authMessage').textContent='Memproses…';
 try{
  if(authMode==='signup'){
   const {data,error}=await supabaseClient.auth.signUp({email,password});if(error)throw error;
   if(!data.session){$('authMessage').textContent='Pendaftaran berhasil. Periksa email untuk verifikasi sebelum masuk.';}
   else await syncAllMonths();
  }else{
   const {error}=await supabaseClient.auth.signInWithPassword({email,password});if(error)throw error;await syncAllMonths();
  }
 }catch(err){$('authMessage').textContent=err.message||'Autentikasi gagal.';}finally{$('authSubmit').disabled=false;}
});
$('recoveryForm')?.addEventListener('submit',async e=>{
 e.preventDefault();
 if(!supabaseClient){$('authMessage').textContent='Koneksi Supabase belum tersedia.';return;}
 const password=$('newPassword').value,confirmPassword=$('confirmPassword').value;
 if(password.length<8){$('authMessage').textContent='Password baru minimal 8 karakter.';return;}
 if(password!==confirmPassword){$('authMessage').textContent='Konfirmasi password tidak sama.';return;}
 $('saveNewPassword').disabled=true;$('authMessage').textContent='Menyimpan password baru…';
 try{
  const {data:{session}}=await supabaseClient.auth.getSession();
  if(!session)throw new Error('Sesi pemulihan tidak ditemukan atau tautan sudah kedaluwarsa. Minta tautan reset baru.');
  const {error}=await supabaseClient.auth.updateUser({password});if(error)throw error;
  await supabaseClient.auth.signOut();cloudReady=false;recoveryMode=false;clearRecoveryUrl();
  $('newPassword').value='';$('confirmPassword').value='';
  setAuthMode('signin');showAuth('Password berhasil diperbarui. Silakan masuk menggunakan password baru.');
  setSync('Belum login');
 }catch(err){$('authMessage').textContent=err.message||'Gagal memperbarui password.';}
 finally{$('saveNewPassword').disabled=false;}
});
$('cancelRecovery')?.addEventListener('click',async()=>{
 recoveryMode=false;clearRecoveryUrl();if(supabaseClient)await supabaseClient.auth.signOut();
 setAuthMode('signin');showAuth('Silakan masuk dengan password akun Anda.');setSync('Belum login');
});
document.addEventListener('click',e=>{
 const button=e.target.closest('[data-toggle-password]');if(!button)return;
 const input=$(button.dataset.togglePassword);if(!input)return;
 const visible=input.type==='password';input.type=visible?'text':'password';
 button.setAttribute('aria-pressed',String(visible));
 button.setAttribute('aria-label',visible?'Sembunyikan password':'Tampilkan password');
 const symbol=button.querySelector('.material-symbols-rounded');if(symbol)symbol.textContent=visible?'visibility_off':'visibility';
});
async function bootCloud(){
 const params=new URLSearchParams(location.search);
 const hashParams=new URLSearchParams(location.hash.replace(/^#/,''));
 const recoveryRequested=params.get('auth')==='reset'||hashParams.get('type')==='recovery';
 if(!BI_CONFIG.url||!BI_CONFIG.anonKey||!window.supabase?.createClient){setSync('Perlu konfigurasi','error');showAuth('Supabase belum dikonfigurasi. Periksa config.js.');return;}
 supabaseClient=window.supabase.createClient(BI_CONFIG.url,BI_CONFIG.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 supabaseClient.auth.onAuthStateChange((event,session)=>{
  if(event==='PASSWORD_RECOVERY'){showRecoveryForm('Tautan pemulihan valid. Buat password baru untuk akun Anda.');}
 });
 const {data:{session},error}=await supabaseClient.auth.getSession();
 if(error)throw error;
 if(recoveryRequested){
  if(session)showRecoveryForm('Tautan pemulihan diterima. Buat password baru untuk melanjutkan.');
  else showRecoveryForm('Sesi pemulihan belum tersedia. Pastikan tautan email belum kedaluwarsa, lalu coba lagi.');
  setSync('Pemulihan password');
  return;
 }
 if(session){try{await syncAllMonths();}catch(e){console.error(e);showAuth('Gagal memuat database: '+e.message);setSync('Database error','error');}}
 else{showAuth();setSync('Belum login');}
}

render();

bootCloud().catch(e=>{console.error(e);showAuth('Tidak dapat menginisialisasi koneksi database.');});
