const STORE='mymoney_finance_v3', OLD='mymoney_simple_v2';
const fmt=n=>'Rp'+Math.round(Number(n)||0).toLocaleString('id-ID');
const clone=o=>JSON.parse(JSON.stringify(o));
const uid=()=>('bi'+Date.now().toString(36)+Math.random().toString(36).slice(2,7));
const DEFAULT_BUDGETS=[['Infak / Sedekah',500000],['Cicilan HP',1125000],['Umi',500000],['Mifta',200000],['Aulia',100000],['Kuota',200000],['Cartridge + Liquid',300000],['Uang pasangan',500000],['Jajan berdua',800000],['Bensin kerja',400000],['Kopi / air PT',200000],['Rumah',700000]];
function weeklyDefaults(name,amount){if(/jajan/i.test(name))return {weeklyEnabled:true,weeklyAmount:Math.round(amount/4)};if(/bensin/i.test(name))return {weeklyEnabled:true,weeklyAmount:Math.round(amount/4)};return {weeklyEnabled:false,weeklyAmount:0};}
const freshMonth=()=>({income:7500000,budgets:DEFAULT_BUDGETS.map(([name,amount])=>({id:uid(),name,amount,paid:false,paymentMode:'cashless',...weeklyDefaults(name,amount)})),weeks:{},balances:[{name:'Rekening',amount:0},{name:'Tunai',amount:0},{name:'Di pasangan',amount:0}],submitted:false});
function normalizeMonth(m){
 m.budgets=(m.budgets||[]).map(b=>{const d=weeklyDefaults(b.name||'',+b.amount||0);return {...b,id:b.id||uid(),paid:!!b.paid,paymentMode:b.paymentMode||'cashless',weeklyEnabled:typeof b.weeklyEnabled==='boolean'?b.weeklyEnabled:d.weeklyEnabled,weeklyAmount:Number.isFinite(+b.weeklyAmount)?+b.weeklyAmount:d.weeklyAmount};});
 m.weeks=m.weeks||{};m.status=m.status||(m.submitted?'submitted':'draft');m.submitted=m.status==='submitted';
 for(const rec of Object.values(m.weeks)){if(rec&&!rec.byBudget){rec.byBudget={};let j=m.budgets.find(b=>/jajan/i.test(b.name)),f=m.budgets.find(b=>/bensin/i.test(b.name));if(j&&rec.together!=null)rec.byBudget[j.id]=+rec.together||0;if(f&&rec.fuel!=null)rec.byBudget[f.id]=+rec.fuel||0;let c=m.budgets.find(b=>/kopi|air pt/i.test(b.name));if(c&&rec.work!=null){rec.byBudget[c.id]=+rec.work||0;if(+rec.work>0){c.weeklyEnabled=true;if(!c.weeklyAmount)c.weeklyAmount=50000;}}}}
 m.balances=m.balances||[{name:'Rekening',amount:0},{name:'Tunai',amount:0},{name:'Di pasangan',amount:0}];return m;
}
function loadState(){try{let s=JSON.parse(localStorage.getItem(STORE));if(s?.months){Object.values(s.months).forEach(normalizeMonth);return s;}let old=JSON.parse(localStorage.getItem(OLD));if(old?.months){let months={};for(let [k,v] of Object.entries(old.months))months[k]=normalizeMonth({income:v.income||7500000,budgets:(v.budgets||[]).map(b=>({...b,id:uid()})),weeks:v.weeks||{},balances:v.balances||[],submitted:!!v.submitted});return {activeMonth:old.activeMonth||'2026-11',months};}}catch(e){}return {activeMonth:'2026-11',months:{'2026-11':freshMonth()}}}
let state=loadState(),month=state.activeMonth||'2026-11',week=1;
const $=id=>document.getElementById(id);
function previousMonthKey(k){let [y,n]=k.split('-').map(Number),d=new Date(y,n-2,1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;}
function current(){if(!state.months[month]){let prevKey=previousMonthKey(month),prev=state.months[prevKey];if(!prev){let keys=Object.keys(state.months).filter(k=>k<month).sort();prev=keys.length?state.months[keys[keys.length-1]]:null;}let next=prev?clone(prev):freshMonth();next.weeks={};next.budgets=next.budgets.map(b=>({...b,id:uid(),paid:false}));next.balances=[{name:'Rekening',amount:0},{name:'Tunai',amount:0},{name:'Di pasangan',amount:0}];next.submitted=false;next.status='draft';delete next.submittedAt;state.months[month]=next;}return normalizeMonth(state.months[month]);}
function totalBudget(m=current()){return m.budgets.reduce((a,b)=>a+(+b.amount||0),0);}
function weeklyBudgets(m=current()){return m.budgets.filter(b=>b.weeklyEnabled&&b.weeklyAmount>0);}
function weeklyUsed(b,rec){if(rec?.byBudget&&rec.byBudget[b.id]!=null)return +rec.byBudget[b.id]||0;if(/jajan/i.test(b.name))return +rec?.together||0;if(/bensin/i.test(b.name))return +rec?.fuel||0;return 0;}
function weekSpent(rec,m=current()){return weeklyBudgets(m).reduce((s,b)=>s+weeklyUsed(b,rec),0);}
function dailyActual(m){return Object.values(m.weeks||{}).reduce((s,w)=>s+weekSpent(w,m),0);}
function paidActual(m){return m.budgets.filter(b=>b.paid).reduce((a,b)=>a+(+b.amount||0),0);}
function actual(m){return paidActual(m)+dailyActual(m);}
function monthName(k){let [y,n]=k.split('-').map(Number);return new Date(y,n-1,1).toLocaleDateString('id-ID',{month:'long',year:'numeric'});}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function iconFor(n){let s=n.toLowerCase();if(s.includes('infak'))return 'volunteer_activism';if(s.includes('hp')||s.includes('cicilan'))return 'smartphone';if(s.includes('umi')||s.includes('mifta')||s.includes('aulia')||s.includes('keluarga'))return 'family_restroom';if(s.includes('pasangan')||s.includes('jajan'))return 'favorite';if(s.includes('bensin'))return 'local_gas_station';if(s.includes('cartridge')||s.includes('liquid'))return 'water_drop';if(s.includes('kuota'))return 'wifi';if(s.includes('kopi')||s.includes('air'))return 'coffee';if(s.includes('rumah'))return 'home';return 'category';}
function render(){
 const m=current(),alloc=totalBudget(m),out=actual(m);
 $('monthTitle').textContent=monthName(month);$('monthStatus').textContent=m.status==='submitted'?'✓ Anggaran tersimpan':'● Draft anggaran';$('monthStatus').className='month-status '+(m.status==='submitted'?'is-submitted':'is-draft');$('submitBudget').textContent=m.status==='submitted'?'✓ Sudah disubmit':'Submit anggaran';$('submitBudget').disabled=m.status==='submitted';$('freeMoney').textContent=fmt(m.income-alloc);$('income').textContent=fmt(m.income);$('allocated').textContent=fmt(alloc);$('paidTotal').textContent=fmt(out);$('budgetTotal').textContent=fmt(alloc);$('budgetCount').textContent=m.budgets.length+' pos';
 $('cashNeed').textContent=fmt(m.budgets.filter(b=>b.paymentMode==='cash'&&!b.paid).reduce((a,b)=>a+(+b.amount||0),0));$('budgetState').textContent=m.submitted?'✓ Anggaran tersimpan':'Belum disubmit';
 $('budgetList').innerHTML=m.budgets.map(b=>`<div class="budget-row"><div class="budget-name"><span class="budget-icon material-symbols-rounded">${iconFor(b.name)}</span><span><strong>${escapeHtml(b.name)}</strong><small>${b.paid?'Sudah terlaksana':'Belum terlaksana'} · ${b.paymentMode==='cash'?'Cash':'Cashless'}${b.weeklyEnabled?' · Mingguan '+fmt(b.weeklyAmount):''}</small></span></div><div class="budget-amount"><b>${fmt(b.amount)}</b><small><input class="paid-toggle" type="checkbox" aria-label="Tandai ${escapeHtml(b.name)} sudah terlaksana" ${b.paid?'checked':''} onchange="togglePaid('${b.id}',this.checked)"> ${b.paid?'Selesai':'Tandai selesai'}</small></div></div>`).join('');
 renderWeeklySections(m);
 $('balanceCards').innerHTML=m.balances.map(b=>`<div class="wallet-card"><small>${escapeHtml(b.name)}</small><b>${fmt(b.amount)}</b></div>`).join('');
 renderHistory();renderTrend();
}
function renderWeeklySections(m){
 const enabled=weeklyBudgets(m),host=$('weeklySections');
 if(!enabled.length){host.innerHTML='<div class="weekly-empty">Belum ada anggaran mingguan aktif. Buka Edit anggaran, lalu aktifkan pemantauan mingguan pada pos yang ingin dipantau.</div>';$('dailyStatus').textContent='Tidak aktif';$('dailySub').textContent='atur di anggaran';$('dailyAverage').textContent='—';return;}
 host.innerHTML=enabled.map(b=>weeklyCard(b)).join('');
 enabled.forEach(b=>{let input=$('weekly-'+b.id);if(input){input.value=weeklyUsed(b,m.weeks[week]);input.addEventListener('input',updateWeeklyCards);}});
 $('dailyStatus').textContent=enabled.length+' pos aktif';$('dailySub').textContent='laporan mingguan';
 let saved=Object.keys(m.weeks).filter(k=>+k>=1&&+k<=4).length;$('dailyAverage').textContent=saved?fmt(Math.round(dailyActual(m)/saved)):'—';
 updateWeeklyCards();
}
function weeklyCard(b){
 const rec=current().weeks[week],spent=weeklyUsed(b,rec),left=b.weeklyAmount-spent;
 return `<article class="weekly-card"><div class="weekly-card-head"><div><span class="weekly-icon material-symbols-rounded">${iconFor(b.name)}</span><span><b>${escapeHtml(b.name)}</b><small>Jatah ${fmt(b.weeklyAmount)} / minggu</small></span></div><span class="week-picker">Minggu <select class="weekly-select" data-week-select="${b.id}">${[1,2,3,4].map(n=>`<option value="${n}" ${week===n?'selected':''}>${n}</option>`).join('')}</select></span></div><div class="weekly-stats"><div><small>Jatah</small><b>${fmt(b.weeklyAmount)}</b></div><div><small>Terpakai</small><b class="spent-value">${fmt(spent)}</b></div><div><small>${left>=0?'Sisa':'Lebih'}</small><b class="left-value">${fmt(Math.abs(left))}</b></div></div><label class="weekly-input-label">Total pemakaian minggu ini<div class="weekly-input"><span>Rp</span><input id="weekly-${b.id}" type="number" min="0" inputmode="numeric" placeholder="Masukkan total terpakai"></div></label><div class="weekly-feedback ${left<0?'over':''}">${left>=0?'Masih tersisa '+fmt(left):'Melebihi anggaran '+fmt(-left)}</div><button class="primary-btn full" data-save-week="${b.id}">✓ Simpan laporan minggu <span>→</span></button><div class="weekly-history">${[1,2,3,4].map(n=>{let x=current().weeks[n],v=weeklyUsed(b,x),d=b.weeklyAmount-v;return `<div><small>W${n}</small><b class="${x?(d<0?'over-text':'good-text'):''}">${x?(d>=0?'Sisa ':'Lebih ')+fmt(Math.abs(d)):'—'}</b></div>`}).join('')}</div></article>`;
}
function updateWeeklyCards(){weeklyBudgets().forEach(b=>{let input=$('weekly-'+b.id);if(!input)return;let card=input.closest('.weekly-card'),spent=+input.value||0,left=b.weeklyAmount-spent;card.querySelector('.spent-value').textContent=fmt(spent);card.querySelector('.left-value').textContent=fmt(Math.abs(left));let fb=card.querySelector('.weekly-feedback');fb.textContent=left>=0?'Masih tersisa '+fmt(left):'Melebihi anggaran '+fmt(-left);fb.classList.toggle('over',left<0);});}
function saveWeekly(id){let b=current().budgets.find(x=>x.id===id),input=$('weekly-'+id);if(!b||!input)return;let m=current();m.weeks[week]=m.weeks[week]||{byBudget:{}};m.weeks[week].byBudget=m.weeks[week].byBudget||{};m.weeks[week].byBudget[id]=+input.value||0;persist();}
$('weeklySections').addEventListener('change',e=>{if(e.target.matches('.weekly-select')){week=+e.target.value||1;renderWeeklySections(current());}});
$('weeklySections').addEventListener('click',e=>{let btn=e.target.closest('[data-save-week]');if(btn)saveWeekly(btn.dataset.saveWeek);});
window.togglePaid=(id,v)=>{let b=current().budgets.find(x=>x.id===id);if(b)b.paid=v;persist();};
function renderHistory(){let keys=Object.keys(state.months).sort().reverse();$('monthHistory').innerHTML=keys.map(k=>{let m=state.months[k];return `<div class="month-row ${k===month?'current':''}"><div><b>${monthName(k)}</b><small>Pemasukan ${fmt(m.income)} · Realisasi tercatat ${fmt(actual(m))}</small></div><div style="text-align:right"><b>${fmt(m.income-totalBudget(m))}</b><small>Belum dialokasikan</small></div><button onclick="openMonth('${k}')">${k===month?'Aktif':'Lihat'}</button></div>`}).join('');}
window.openMonth=k=>{month=k;week=1;persist();window.scrollTo({top:0,behavior:'smooth'});};
function renderTrend(){let count=+$('trendRange').value||6,keys=Object.keys(state.months).sort().slice(-count),vals=keys.map(k=>{let m=state.months[k];return {k,alloc:totalBudget(m),actual:actual(m),free:m.income-totalBudget(m)};});if(!vals.length){$('trendChart').innerHTML='<p>Belum ada data.</p>';return;}let max=Math.max(1,...vals.flatMap(v=>[v.alloc,v.actual,v.free])),W=620,H=175,left=8,right=8,top=12,bottom=28,innerH=H-top-bottom,step=(W-left-right)/vals.length,bw=Math.min(22,step*.22),y=v=>top+innerH-(v/max)*innerH;let svg=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">`;for(let i=0;i<4;i++){let yy=top+i*innerH/3;svg+=`<line x1="${left}" y1="${yy}" x2="${W-right}" y2="${yy}" stroke="currentColor" opacity=".12" stroke-dasharray="3 4"/>`;}vals.forEach((v,i)=>{let cx=left+step*i+step/2;[{v:v.alloc,c:'#243b60',dx:-bw-2},{v:v.actual,c:'#4da486',dx:0},{v:v.free,c:'#efad89',dx:bw+2}].forEach(b=>{let yy=y(b.v),hh=top+innerH-yy;svg+=`<rect x="${cx+b.dx-bw/2}" y="${yy}" width="${bw}" height="${Math.max(1,hh)}" rx="4" fill="${b.c}"/>`;});svg+=`<text x="${cx}" y="${H-8}" text-anchor="middle" font-size="10" fill="currentColor">${monthName(v.k).slice(0,3)}</text>`;});svg+='</svg>';$('trendChart').innerHTML=svg;let avg=vals.reduce((a,v)=>a+v.actual,0)/vals.length,last=vals.at(-1);$('trendSummary').innerHTML=`<div class="trend-kpi"><small>Rata-rata realisasi tercatat</small><b>${fmt(avg)}</b></div><div class="trend-kpi"><small>Belum dialokasikan bulan ini</small><b>${fmt(last.free)}</b></div>`;}
$('trendRange').onchange=renderTrend;
$('prevMonth').onclick=()=>shiftMonth(-1);$('nextMonth').onclick=()=>shiftMonth(1);
function shiftMonth(n){let [y,m]=month.split('-').map(Number),d=new Date(y,m-1+n,1);month=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;week=1;persist();}
$('newMonth').onclick=()=>{let v=prompt('Bulan baru (format YYYY-MM), contoh 2026-12');if(!v||!/^\d{4}-\d{2}$/.test(v))return;if(state.months[v]){alert('Bulan sudah ada. Buka melalui Riwayat.');return;}let prev=clone(current());prev.weeks={};prev.budgets.forEach(b=>{b.id=uid();b.paid=false;});prev.submitted=false;prev.status='draft';delete prev.submittedAt;prev.balances=[{name:'Rekening',amount:0},{name:'Tunai',amount:0},{name:'Di pasangan',amount:0}];state.months[v]=prev;month=v;week=1;persist();};
function showModal(title,body,saveFn){$('modalTitle').textContent=title;$('modalBody').innerHTML=body;$('modalSave').textContent=title.startsWith('Edit anggaran')?'✓ Simpan & submit anggaran':'✓ Simpan perubahan';$('modal').showModal();$('modalSave').onclick=e=>{e.preventDefault();saveFn();$('modal').close();persist();};}
$('editBudget').onclick=()=>{let m=current();showModal('Edit anggaran '+monthName(month),`<label class="modal-field">Pemasukan bulan ini (Rp)<input id="editIncome" type="number" value="${m.income}"></label><p class="modal-help">Ubah nama, nominal, metode Cash/Cashless, dan status pos. Aktifkan pemantauan mingguan pada pos yang ingin memiliki laporan mingguan terpisah. Anggaran bulan lain tidak berubah.</p><div id="editRows">${m.budgets.map(b=>budgetEditRow(b)).join('')}</div><button type="button" class="add-row" id="addBudgetRow">＋ Tambah pos anggaran</button>`,()=>{m.income=+$('editIncome').value||0;m.budgets=[...document.querySelectorAll('.edit-row')].map(row=>({id:row.dataset.id||uid(),name:row.querySelector('.edit-name').value.trim(),amount:+row.querySelector('.edit-amount').value||0,paid:row.querySelector('.edit-paid').checked,paymentMode:row.querySelector('.edit-mode:checked').value,weeklyEnabled:row.querySelector('.edit-weekly').checked,weeklyAmount:+row.querySelector('.edit-weekly-amount').value||0})).filter(b=>b.name);m.submitted=m.status==='submitted';if(m.submitted)m.submittedAt=m.submittedAt||new Date().toISOString();});$('addBudgetRow').onclick=()=> $('editRows').insertAdjacentHTML('beforeend',budgetEditRow({id:uid(),name:'Pos baru',amount:0,paid:false,paymentMode:'cashless',weeklyEnabled:false,weeklyAmount:0}));};
function budgetEditRow(b){return `<div class="edit-row" data-id="${b.id}"><input class="edit-name" aria-label="Nama pos" value="${escapeHtml(b.name)}"><input class="edit-amount" aria-label="Nominal pos" type="number" value="${b.amount}"><div class="payment-choice"><label><input class="edit-mode" type="radio" name="mode-${b.id}" value="cash" ${b.paymentMode==='cash'?'checked':''}><span>☑ Cash</span></label><label><input class="edit-mode" type="radio" name="mode-${b.id}" value="cashless" ${b.paymentMode!=='cash'?'checked':''}><span>☑ Cashless</span></label></div><button type="button" aria-label="Hapus pos" onclick="this.closest('.edit-row').remove()">×</button><label class="modal-help" style="grid-column:1/-1"><input class="edit-paid" type="checkbox" ${b.paid?'checked':''}> Sudah terlaksana / dibayarkan</label><div class="weekly-config"><label><input class="edit-weekly" type="checkbox" ${b.weeklyEnabled?'checked':''}> Pantau sebagai anggaran mingguan</label><input class="edit-weekly-amount" type="number" aria-label="Jatah per minggu" placeholder="Jatah per minggu" value="${b.weeklyAmount||''}" ${b.weeklyEnabled?'':'disabled'}></div></div>`;}
$('modalBody').addEventListener('change',e=>{if(e.target.classList.contains('edit-weekly')){let row=e.target.closest('.edit-row'),amt=row.querySelector('.edit-weekly-amount');amt.disabled=!e.target.checked;if(e.target.checked&&!amt.value)amt.value=Math.round((+row.querySelector('.edit-amount').value||0)/4);}});
$('editBalances').onclick=()=>{let m=current();showModal('Saldo aktual',`<p class="modal-help">Isi uang yang benar-benar masih tersedia. Uang yang sudah diberikan tidak lagi dihitung sebagai saldo Anda.</p>${m.balances.map((b,i)=>`<label class="modal-field">${escapeHtml(b.name)}<input class="balance-edit" data-index="${i}" type="number" value="${b.amount}"></label>`).join('')}`,()=>document.querySelectorAll('.balance-edit').forEach(x=>m.balances[+x.dataset.index].amount=+x.value||0));};
$('backupBtn').onclick=()=>showModal('Backup & pemulihan',`<p class="modal-help">Data tersimpan di browser. Buat backup berkala. Untuk menggunakan data yang sama di beberapa perangkat, dibutuhkan sinkronisasi cloud.</p><button type="button" class="add-row" id="exportBackup">Unduh backup JSON</button><label class="modal-field">Pulihkan backup JSON<input id="importBackup" type="file" accept="application/json"></label>`,()=>{});
$('modalBody').addEventListener('click',e=>{if(e.target.id==='exportBackup'){let blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='budget-in-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}});
$('modalBody').addEventListener('change',async e=>{if(e.target.id==='importBackup'){try{let s=JSON.parse(await e.target.files[0].text());if(!s.months)throw Error();state=s;month=state.activeMonth||Object.keys(s.months).sort().at(-1);persist();$('modal').close();}catch{alert('Backup tidak valid.');}}});
$('dismissHint').onclick=()=>{$('installHint').remove();localStorage.setItem('budgetin_install_dismissed','1');};if(localStorage.getItem('budgetin_install_dismissed'))$('installHint').remove();
document.querySelectorAll('.bottom-nav a').forEach(a=>a.addEventListener('click',()=>{document.querySelectorAll('.bottom-nav a').forEach(x=>x.classList.remove('active'));a.classList.add('active');}));
const THEME_KEY='mymoney_theme_v1';function applyTheme(t){document.documentElement.dataset.theme=t;localStorage.setItem(THEME_KEY,t);let icon=$('themeIcon');if(icon)icon.textContent=t==='dark'?'light_mode':'dark_mode';let meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=t==='dark'?'#0c1422':'#101f3d';}
applyTheme(localStorage.getItem(THEME_KEY)||'light');$('themeToggle')?.addEventListener('click',()=>applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark'));
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));

// ── Budget-in V3.5: Supabase authentication and cloud persistence ──
const BI_CONFIG=window.BUDGETIN_SUPABASE||{};
let supabaseClient=null,authMode='signin',cloudReady=false,saveQueue=Promise.resolve();
const setSync=(label,kind='')=>{const el=$('syncStatus');if(el){el.textContent=label;el.className='sync-status '+kind;}};
function showAuth(message=''){const gate=$('authGate');if(gate){gate.hidden=false;$('appShell').classList.add('app-locked');$('authMessage').textContent=message;}}
function hideAuth(){const gate=$('authGate');if(gate){gate.hidden=true;$('appShell').classList.remove('app-locked');}}
function setAuthMode(mode){authMode=mode;$('authTitle').textContent=mode==='signup'?'Buat akun Budget-in':'Masuk ke Budget-in';$('authSubmit').textContent=mode==='signup'?'Daftar':'Masuk';$('authSwitch').textContent=mode==='signup'?'Sudah punya akun? Masuk':'Belum punya akun? Daftar';$('authPassword').autocomplete=mode==='signup'?'new-password':'current-password';}
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
   for(const r of rows||[]){state.months[r.month_key]=normalizeMonth({...r.data,status:r.status,submitted:r.status==='submitted',submittedAt:r.submitted_at||r.data?.submittedAt});}
   for(const [k,m] of Object.entries(local.months||{})){if(!remoteKeys.has(k)){state.months[k]=normalizeMonth(m);await cloudSaveMonth(k,state.months[k]);}}
 }
 const keys=Object.keys(state.months).sort();month=state.months[local.activeMonth]?local.activeMonth:(keys[keys.length-1]||month);
 state.activeMonth=month;localStorage.setItem(STORE,JSON.stringify(state));cloudReady=true;render();setSync('Tersinkron','ok');hideAuth();
}
function persist(){
 current();state.activeMonth=month;localStorage.setItem(STORE,JSON.stringify(state));render();
 if(supabaseClient&&cloudReady){const k=month,m=clone(current());saveQueue=saveQueue.then(()=>cloudSaveMonth(k,m)).then(()=>setSync('Tersinkron','ok')).catch(e=>{console.error('Cloud save failed',e);setSync('Gagal sinkron','error');});setSync('Menyimpan…','busy');}
}
async function submitCurrentBudget(){
 const m=current();if(!m.budgets.length){alert('Tambahkan minimal satu pos anggaran sebelum submit.');return;}
 const total=totalBudget(m);if(total<0||m.income<0){alert('Pemasukan dan alokasi tidak boleh negatif.');return;}
 const ok=confirm(`Submit anggaran ${monthName(month)}?\n\nPemasukan: ${fmt(m.income)}\nTotal alokasi: ${fmt(total)}\nSisa belum dialokasikan: ${fmt(m.income-total)}\n\nAnggaran akan disimpan ke database. Revisi berikutnya akan menimpa versi aktif bulan ini.`);
 if(!ok)return;
 m.status='submitted';m.submitted=true;m.submittedAt=new Date().toISOString();
 persist();
 if(supabaseClient&&cloudReady){try{await saveQueue;await cloudSaveMonth(month,m);setSync('Tersimpan','ok');alert('Anggaran berhasil disubmit dan disimpan.');}catch(e){m.status='draft';m.submitted=false;persist();alert('Gagal menyimpan ke database: '+e.message);}}
 else alert('Anggaran tersimpan lokal. Login dan konfigurasi Supabase diperlukan untuk penyimpanan cloud.');
}
$('submitBudget')?.addEventListener('click',submitCurrentBudget);
$('accountBtn')?.addEventListener('click',async()=>{if(!supabaseClient)return;const {data}=await supabaseClient.auth.getUser();if(data?.user){if(confirm(`Login sebagai ${data.user.email}.\nKeluar dari akun Budget-in?`)){await supabaseClient.auth.signOut();cloudReady=false;setSync('Keluar');showAuth('Anda telah keluar. Masuk kembali untuk mengakses data cloud.');}}else showAuth();});
$('authSwitch')?.addEventListener('click',()=>setAuthMode(authMode==='signin'?'signup':'signin'));
$('authForm')?.addEventListener('submit',async e=>{
 e.preventDefault();if(!supabaseClient){$('authMessage').textContent='Supabase belum dikonfigurasi. Isi URL dan publishable/anon key pada config.js.';return;}
 const email=$('authEmail').value.trim(),password=$('authPassword').value;$('authSubmit').disabled=true;$('authMessage').textContent='Memproses…';
 try{
  if(authMode==='signup'){const {data,error}=await supabaseClient.auth.signUp({email,password});if(error)throw error;if(!data.session){$('authMessage').textContent='Pendaftaran berhasil. Periksa email untuk verifikasi, lalu masuk.';}else await syncAllMonths();}
  else{const {error}=await supabaseClient.auth.signInWithPassword({email,password});if(error)throw error;await syncAllMonths();}
 }catch(err){$('authMessage').textContent=err.message||'Autentikasi gagal.';}finally{$('authSubmit').disabled=false;}
});
async function bootCloud(){
 if(!BI_CONFIG.url||!BI_CONFIG.anonKey||!window.supabase?.createClient){setSync('Perlu konfigurasi','error');showAuth('Supabase belum dikonfigurasi. Lengkapi config.js dan jalankan SQL schema yang disertakan.');return;}
 supabaseClient=window.supabase.createClient(BI_CONFIG.url,BI_CONFIG.anonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
 const {data:{session}}=await supabaseClient.auth.getSession();
 if(session){try{await syncAllMonths();}catch(e){console.error(e);showAuth('Gagal memuat database: '+e.message);setSync('Database error','error');}}
 else{showAuth();setSync('Belum login');}
}

render();

bootCloud().catch(e=>{console.error(e);showAuth('Tidak dapat menginisialisasi koneksi database.');});
