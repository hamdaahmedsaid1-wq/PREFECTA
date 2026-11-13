/* PREFECTA 3.1.3 — pages Vite et API Node/MySQL. */
import { PAGE_URLS, escapeHtml } from './layout.js';
import { canEditDossiers } from './permissions.js';
(function(){
'use strict';
const icons={
 grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 folders:'<path d="M3 7V5a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M3 9h18"/>',
 building:'<rect x="4" y="7" width="16" height="14" rx="1"/><path d="M9 7V3h6v4M8 12h2m4 0h2M8 16h2m4 0h2M11 21v-4h2v4"/>',
 bar:'<path d="M4 20V12m6 8V5m6 15v-9m4 9V3" stroke-width="2.4"/>',users:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.9l.07.07-2.7 2.7-.08-.07a1.7 1.7 0 0 0-1.9-.34 1.7 1.7 0 0 0-1 1.6V21h-3.8v-.14a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.34l-.07.07-2.7-2.7.07-.08a1.7 1.7 0 0 0 .34-1.9 1.7 1.7 0 0 0-1.6-1H3v-3.8h.14a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.34-1.9l-.07-.07 2.7-2.7.08.07a1.7 1.7 0 0 0 1.9.34 1.7 1.7 0 0 0 1-1.6V3h3.8v.14a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.34l.07-.07 2.7 2.7-.07.08a1.7 1.7 0 0 0-.34 1.9 1.7 1.7 0 0 0 1.6 1H21v3.8h-.14a1.7 1.7 0 0 0-1.6 1z"/>',
 shield:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',check:'<path d="m5 12 4 4L19 6"/>',menu:'<path d="M3 6h18M3 12h18M3 18h18"/>',search:'<circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/>',download:'<path d="M12 3v12m-4-4 4 4 4-4M5 17v4h14v-4"/>',
 'arrow-right':'<path d="M5 12h14m-6-6 6 6-6 6"/>','chevron-down':'<path d="m6 9 6 6 6-6"/>',dots:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>', x:'<path d="M18 6 6 18M6 6l12 12"/>', edit:'<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L9 17l-4 1 1-4z"/>',info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6m0-10h.01"/>',clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8m-8 4h8"/>',alert:'<path d="m12 3 10 18H2z"/><path d="M12 9v4m0 4h.01"/>',archive:'<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v11h14V9M10 13h4"/>'};
const $=id=>document.getElementById(id);
const escaped=escapeHtml;
const sym=name=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">${icons[name]||icons.file}</svg>`;
function applyIcons(root=document){root.querySelectorAll('[data-icon]').forEach(n=>n.innerHTML=sym(n.dataset.icon));}
let SERVICES=[];
const STATUS=['Reçu','En cours','Validé','Rejeté','Archivé'];
const colors={'Reçu':'#428af0','En cours':'#f3b751','Validé':'#28b394','Rejeté':'#e36e7b','Archivé':'#98a9bb'};
let state={dossiers:[],agents:[],services:[],journal:[],mode:'server',user:null,page:document.body.dataset.page||'dashboard',pageIndex:1,editing:null};
let toastTimer;
function notify(message){const n=$('toast');n.textContent=message;n.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>n.classList.remove('show'),3000);}
const fmt=d=>{if(!d)return '—';const raw=String(d).slice(0,10);let v=new Date(`${raw}T12:00:00`);return Number.isNaN(v.getTime())?raw:v.toLocaleDateString('fr-FR',{day:'2-digit',month:'short',year:'numeric'});};
const money=(n)=>new Intl.NumberFormat('fr-FR').format(n);
function statuses(){return STATUS.map(s=>({name:s,count:state.dossiers.filter(d=>d.statut===s).length}));}
function badgeStatus(s){const cls={'Reçu':'rec','En cours':'progress','Validé':'valid','Rejeté':'reject','Archivé':'archive'}[s]||'archive';return `<span class="tag ${cls}">${escaped(s)}</span>`;}
async function api(path,opts={}){const token=sessionStorage.getItem('prefecta_token');let res;try{res=await fetch('/api'+path,{...opts,headers:{'Content-Type':'application/json',...(token?{'Authorization':`Bearer ${token}`}:{}) ,...(opts.headers||{})}});}catch(e){throw Error('Serveur inaccessible. Vérifie npm start et le port 3000.');}let data;try{data=await res.json();}catch(e){data={error:'Réponse serveur invalide'}}if(res.status===401&&path!=='/auth/login'){sessionStorage.removeItem('prefecta_token');state.user=null;state.dossiers=[];state.agents=[];state.services=[];renderAll();$('login-overlay').hidden=false;}if(!res.ok)throw Error(data.error||`Erreur HTTP ${res.status}`);return data;}
async function refreshServer(){const [d,a,sv]=await Promise.all([api('/dossiers'),api('/utilisateurs'),api('/services')]);state.dossiers=d;state.agents=a;state.services=sv;SERVICES=sv.filter(x=>x.actif).map(x=>x.nom);updateServiceOptions();renderAll();if(state.user?.role==='Administrateur')await refreshJournal();}
async function startup(){
  applyIcons();
  $('today-label').textContent=new Date().toLocaleDateString('fr-FR',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
  wire();
  // Aucun mode simulation : le frontend exige l'API Node.js et la base MySQL.
  if(location.protocol==='file:'){document.body.textContent='Démarrez le serveur Node.js puis ouvrez http://localhost:3000';return;}
  state.mode='server';
  $('env-tag').innerHTML='<span class="live-dot"></span> MySQL connecté';
  if($('setting-mode'))$('setting-mode').textContent='Serveur Node.js + MySQL';
  $('login-overlay').hidden=false;
  let online=false;let correctVersion=false;
  try{const response=await fetch('/api/health',{cache:'no-store'});online=response.ok;const health=await response.json();correctVersion=String(health.version||'').startsWith('3.1.');}catch(e){}
  if(!online||!correctVersion){
    $('login-error').textContent=!online?'MySQL ou le serveur est indisponible. Vérifie WAMP, ton fichier .env et le terminal Node.js.':'Une ancienne version de PREFECTA utilise le port 3000. Arrête V2/V3 et démarre V3.1.';
    $('login-form').querySelector('button[type=submit]').disabled=true;
    renderAll();return;
  }
  const token=sessionStorage.getItem('prefecta_token');
  if(token){
    try{
      const user=await api('/auth/me');state.user=user;
      if(['agents','journal'].includes(state.page)&&user.role!=='Administrateur'){location.replace('/src/pages/tableau-de-bord.html');return;}
      $('account-name').textContent=user.nom;$('account-sub').textContent=user.role;
      await refreshServer();$('login-overlay').hidden=true;return;
    }catch(e){sessionStorage.removeItem('prefecta_token');}
  }
  renderAll();
}
function renderAll(){
  switch(state.page){
    case 'dashboard':renderDashboard();break;
    case 'dossiers':renderDossiers();break;
    case 'detail':renderDossierDetail();break;
    case 'services':renderServices();break;
    case 'rapports':renderRapports();break;
    case 'agents':renderAgents();break;
    case 'journal':renderJournal();break;
  }
  updateRoleUI();
  $('sidebar-count').textContent=state.dossiers.filter(d=>d.statut!=='Archivé').length;
  applyIcons();
}
function renderDashboard(){const all=state.dossiers;const stats=[{label:'Total des dossiers',value:all.length,icon:'folders',color:'blue',note:'Dossiers enregistrés'},{label:'Dossiers en cours',value:all.filter(d=>d.statut==='En cours').length,icon:'clock',color:'orange',note:'En attente de traitement'},{label:'Dossiers validés',value:all.filter(d=>d.statut==='Validé').length,icon:'check',color:'green',note:'Traités favorablement'},{label:'Priorité urgente',value:all.filter(d=>d.priorite==='Urgente'&&d.statut!=='Validé'&&d.statut!=='Archivé').length,icon:'alert',color:'red',note:'Nécessitent une attention'}];
$('kpi-grid').innerHTML=stats.map(s=>`<div class="kpi"><div class="kpi-top"><div class="kpi-title">${s.label}</div><div class="kpi-icon ${s.color}">${sym(s.icon)}</div></div><div class="kpi-number">${money(s.value)}</div><div class="kpi-bottom">${s.note}</div></div>`).join('');
const now=new Date();const months=Array.from({length:6},(_,idx)=>{let d=new Date(now.getFullYear(),now.getMonth()-5+idx,1);return{key:`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,name:d.toLocaleDateString('fr-FR',{month:'short'})};});const counts=months.map(m=>({...m,value:all.filter(d=>String(d.date_depot).startsWith(m.key)).length}));let max=Math.max(...counts.map(m=>m.value),1);$('activity-chart').innerHTML=counts.map((m,i)=>`<div class="chart-col"><div class="chart-bar ${i<2?'dim':''}" data-value="${m.value}" style="height:${Math.max(3,(m.value/max)*93)}%"></div><span class="chart-name">${m.name}</span></div>`).join('');
const sts=statuses(),n=Math.max(all.length,1);let from=0;const sectors=sts.map(s=>{const start=from;from+=100*s.count/n;return `${colors[s.name]} ${start.toFixed(2)}% ${from.toFixed(2)}%`});$('distribution').innerHTML=`<div class="donut" style="background:conic-gradient(${sectors.join(',')})"><div class="donut-center"><strong>${all.length}</strong><small>Dossiers</small></div></div><div class="legend">${sts.filter(s=>s.count>0).map(s=>`<div class="legend-item"><i class="legend-dot" style="background:${colors[s.name]}"></i>${escaped(s.name)}<b>${s.count}</b></div>`).join('')}</div>`;
$('recent-rows').innerHTML=[...all].sort((a,b)=>new Date(b.date_depot)-new Date(a.date_depot)||Number(b.id)-Number(a.id)).slice(0,6).map(d=>`<tr><td class="record-no">${escaped(d.numero)}</td><td><div class="record-main">${escaped(d.objet)}</div><div class="record-sub">${escaped(d.demandeur)}</div></td><td>${escaped(d.service)}</td><td>${fmt(d.date_depot)}</td><td>${badgeStatus(d.statut)}</td><td><div class="detail-row-actions"><a class="table-action detail-view-link" href="/src/pages/dossier-detail.html?id=${Number(d.id)}" title="Consulter le dossier">Voir</a><button class="table-action" data-edit="${Number(d.id)}" title="Modifier le dossier">${sym('edit')}</button></div></td></tr>`).join('')||'<tr><td colspan="6" class="empty">Aucun dossier pour le moment.</td></tr>';}
function renderDossiers(){const q=($('dossier-search').value||'').trim().toLocaleLowerCase('fr');const status=$('filter-status').value;const service=$('filter-service').value;let all=state.dossiers.filter(d=>(!status||d.statut===status)&&(!service||d.service===service)&&(!q||[d.numero,d.demandeur,d.objet,d.service].some(v=>String(v).toLocaleLowerCase('fr').includes(q)))).sort((a,b)=>new Date(b.date_depot)-new Date(a.date_depot)||Number(b.id)-Number(a.id));const per=8;const pages=Math.max(1,Math.ceil(all.length/per));state.pageIndex=Math.min(Math.max(1,state.pageIndex),pages);const shown=all.slice((state.pageIndex-1)*per,state.pageIndex*per);$('list-counter').textContent=`${all.length} dossier${all.length>1?'s':''} trouvé${all.length>1?'s':''}`;$('all-rows').innerHTML=shown.map(d=>`<tr><td class="record-no">${escaped(d.numero)}</td><td class="record-main">${escaped(d.demandeur)}</td><td>${escaped(d.objet)}</td><td>${escaped(d.service)}</td><td><span class="tag ${d.priorite==='Urgente'?'urgent':'normal'}">${escaped(d.priorite)}</span></td><td>${badgeStatus(d.statut)}</td><td><div class="detail-row-actions"><a class="table-action detail-view-link" href="/src/pages/dossier-detail.html?id=${Number(d.id)}" title="Consulter le dossier">Voir</a><button class="table-action" data-edit="${Number(d.id)}" title="Modifier">${sym('edit')}</button></div></td></tr>`).join('')||'<tr><td colspan="7" class="empty">Aucun dossier ne correspond à votre recherche.</td></tr>';$('pagination-label').textContent=all.length?`${(state.pageIndex-1)*per+1} à ${Math.min(all.length,state.pageIndex*per)} sur ${all.length}`:'Aucun résultat';$('pagination').innerHTML=Array.from({length:pages},(_,i)=>`<button class="${i+1===state.pageIndex?'active':''}" data-page-index="${i+1}" aria-label="Page ${i+1}">${i+1}</button>`).join('');}
// Chargement réel de la fiche et de son historique depuis l'API contrôlée par le backend.
async function renderDossierDetail(){
  if(!state.user)return;
  const loading=$('detail-loading'),content=$('detail-data'),error=$('detail-error');
  const id=new URLSearchParams(location.search).get('id');
  content.hidden=true;error.hidden=true;
  if(!id||!/^[1-9]\d*$/.test(id)){
    loading.hidden=true;error.textContent='Référence de dossier invalide.';error.hidden=false;return;
  }
  loading.hidden=false;loading.textContent='Chargement de la fiche et de son historique…';
  try{
    const [d,events]=await Promise.all([
      api('/dossiers/'+encodeURIComponent(id)),
      api('/dossiers/'+encodeURIComponent(id)+'/historique')
    ]);
    if(!state.user)return;
    const field=(label,value)=>`<div class="detail-field"><dt>${label}</dt><dd>${escaped(value??'—')}</dd></div>`;
    $('detail-title').textContent=d.numero||'Dossier n°'+id;
    $('detail-summary').textContent=d.objet||'Dossier administratif';
    $('detail-reference').textContent=d.numero||'—';
    $('detail-status').innerHTML=badgeStatus(d.statut);
    $('detail-priority').innerHTML=`<span class="tag ${d.priorite==='Urgente'?'urgent':'normal'}">${escaped(d.priorite)}</span>`;
    $('detail-fields').innerHTML=[
      field('Demandeur',d.demandeur),field('Objet',d.objet),
      field('Service responsable',d.service),field('Catégorie',d.categorie),
      field('Date de dépôt',fmt(d.date_depot)),field('Créé par',d.createur||'Compte non disponible'),
      field('Date de création',d.cree_le?new Date(d.cree_le).toLocaleString('fr-FR'):'—'),
      field('Dernière modification',d.modifie_le?new Date(d.modifie_le).toLocaleString('fr-FR'):'—')
    ].join('');
    $('detail-description').textContent=d.description||'Aucune observation enregistrée.';
    $('detail-events').innerHTML=events.length?events.map(j=>`<li class="detail-event"><span class="detail-event-dot"></span><div><b>${escaped(j.type_action)}</b><p>${escaped(j.details||'Opération enregistrée.')}</p><small>${escaped(j.agent||'Compte inconnu')} · ${escaped(new Date(j.horodatage).toLocaleString('fr-FR'))}</small></div></li>`).join('')
      :'<li class="detail-event"><div>Pas encore d’événement enregistré pour ce dossier.</div></li>';
    const btn=$('detail-edit');
    if(btn){btn.dataset.edit=String(d.id);btn.hidden=!canEditDossiers(state.user);}
    loading.hidden=true;content.hidden=false;
  }catch(e){
    loading.hidden=true;error.textContent='Impossible de charger le dossier : '+e.message;
    error.hidden=false;
  }
}
function updateServiceOptions(){
 const f=$('filter-service'),d=$('field-service');
 const selectedFilter=f?.value||'',selectedDossier=d?.value||'';
 const active=state.services.filter(x=>x.actif);
 if(f){
   f.innerHTML='<option value="">Tous les services</option>'+active.map(x=>`<option value="${escaped(x.nom)}">${escaped(x.nom)}</option>`).join('');
   f.value=SERVICES.includes(selectedFilter)?selectedFilter:'';
 }
 if(d){
   d.innerHTML='<option value="">Choisir un service</option>'+active.map(x=>`<option value="${escaped(x.nom)}">${escaped(x.nom)}</option>`).join('');
   d.value=SERVICES.includes(selectedDossier)?selectedDossier:'';
 }
}
function renderServices(){
 let total=Math.max(1,state.dossiers.length);
 const iconsFor=['building','file','users','archive'];
 $('service-cards').innerHTML=state.services.map((srv,i)=>{
   const n=state.dossiers.filter(d=>d.service===srv.nom).length;
   const admin=state.user?.role==='Administrateur';
   const actions=admin?`<div class="service-actions"><button class="button outlined" data-service-edit="${srv.id}">Modifier</button> <button class="button outlined" data-service-toggle="${srv.id}">${srv.actif?'Désactiver':'Réactiver'}</button></div>`:'';
   return `<article class="service-card"><div class="service-head"><div class="service-ico">${sym(iconsFor[i%4])}</div><div><h3>${escaped(srv.nom)}</h3><p>${escaped(srv.description||'Service administratif')} · ${srv.actif?'Actif':'Inactif'}</p></div></div><div class="service-num">${n} <small>dossiers enregistrés</small></div><div class="service-progress"><span style="width:${(n/total)*100}%"></span></div>${actions}</article>`;
 }).join('')||'<div class="information-card">Aucun service enregistré.</div>';
 $('add-service').hidden=state.user?.role!=='Administrateur';
}
function renderRapports(){const total=state.dossiers.length;const validated=state.dossiers.filter(d=>d.statut==='Validé').length;const urgent=state.dossiers.filter(d=>d.priorite==='Urgente').length;const metric=[{label:'Dossiers analysés',v:total,icon:'folders',color:'blue'},{label:'Taux de validation',v:(total?Math.round(100*validated/total):0)+' %',icon:'check',color:'green'},{label:'Dossiers urgents',v:urgent,icon:'alert',color:'red'},{label:'Services suivis',v:state.services.filter(x=>x.actif).length,icon:'building',color:'orange'}];$('report-metrics').innerHTML=metric.map(x=>`<div class="kpi"><div class="kpi-top"><div class="kpi-title">${x.label}</div><div class="kpi-icon ${x.color}">${sym(x.icon)}</div></div><div class="kpi-number">${x.v}</div><div class="kpi-bottom">Données enregistrées</div></div>`).join('');
$('service-bars').innerHTML=SERVICES.map(s=>{const n=state.dossiers.filter(d=>d.service===s).length;return `<div><div class="service-line"><span>${escaped(s)}</span><b>${n}</b></div><div class="service-track"><span style="width:${total?n/total*100:0}%"></span></div></div>`;}).join('');$('report-status').innerHTML=statuses().map(s=>`<div class="report-status-row"><span>${badgeStatus(s.name)}</span><strong>${s.count}</strong></div>`).join('');}
function renderAgents(){
  $('agents-rows').innerHTML=state.agents.map(a=>{
    const actions=state.user?.role==='Administrateur'?`<div class="row-actions"><button class="table-action" data-agent-service="${a.id}" title="Affecter un service">Service</button><button class="table-action" data-agent-role="${a.id}" title="Modifier le rôle">Rôle</button><button class="table-action" data-agent-toggle="${a.id}" title="Activer ou désactiver">${a.actif?'Désactiver':'Activer'}</button><button class="table-action" data-agent-password="${a.id}" title="Réinitialiser le mot de passe">Mot de passe</button></div>`:'';
    return `<tr><td class="record-main">${escaped(a.nom)}</td><td>${escaped(a.email)}</td><td>${escaped(a.role)}${a.role!=='Administrateur'?` · ${escaped(state.services.find(s=>Number(s.id)===Number(a.service_id))?.nom||'Non affecté')}`:''}</td><td><span class="tag ${a.actif?'valid':'archive'}">${a.actif?'Actif':'Inactif'}</span></td><td>${actions}</td></tr>`;
  }).join('')||'<tr><td class="empty" colspan="5">Aucun utilisateur</td></tr>';
}
function renderJournal(){
  $('journal-rows').innerHTML=(state.journal||[]).map(j=>`<tr><td>${escaped(new Date(j.horodatage).toLocaleString('fr-FR'))}</td><td>${escaped(j.agent||'—')}</td><td>${escaped(j.type_action)}</td><td>${escaped(j.reference_dossier||'—')}</td><td>${escaped(j.details||'—')}</td></tr>`).join('')||'<tr><td class="empty" colspan="5">Aucun événement à afficher.</td></tr>';
}
async function refreshJournal(){
  if(state.mode!=='server'||state.user?.role!=='Administrateur'||state.page!=='journal')return;
  try{state.journal=await api('/journal');renderJournal();}catch(e){notify('Journal indisponible : '+e.message);}
}
function updateRoleUI(){
  const role=state.user?.role;
  const canEdit=canEditDossiers(state.user);
  ['dashboard-add','dossier-add'].forEach(id=>{if($(id))$(id).hidden=!canEdit;});
  if($('add-agent'))$('add-agent').hidden=role!=='Administrateur';
  document.querySelectorAll('[data-page="journal"],[data-page="agents"]').forEach(n=>n.hidden=role!=='Administrateur');
  document.querySelectorAll('[data-edit]').forEach(n=>n.hidden=!canEdit);
  if(state.user?.role==='Agent'&&!state.user?.service_id)notify('Ton compte doit être affecté à un service par l’administrateur.');
}
async function editAgent(id,operation){
  if(state.user?.role!=='Administrateur')return notify('Action réservée aux administrateurs.');
  const agent=state.agents.find(a=>Number(a.id)===Number(id));if(!agent)return;
  try{
    if(operation==='service'){
      const options=state.services.filter(s=>s.actif).map(s=>`${s.id} : ${s.nom}`).join('\n');
      const service_id=Number(prompt('Identifiant du service à affecter :\n'+options,agent.service_id||''));
      if(!Number.isSafeInteger(service_id)||service_id<1)return notify('Service invalide.');
      await api(`/utilisateurs/${id}`,{method:'PATCH',body:JSON.stringify({role:agent.role,actif:!!agent.actif,service_id})});
    }else if(operation==='role'){
      const role=prompt('Nouveau rôle (Administrateur, Agent, Lecteur) :',agent.role);
      if(!role)return;if(!['Administrateur','Agent','Lecteur'].includes(role))return notify('Rôle incorrect.');
      let service_id=agent.service_id;
      if(role!=='Administrateur'&&!service_id){
        const options=state.services.filter(s=>s.actif).map(s=>`${s.id} : ${s.nom}`).join('\n');
        service_id=Number(prompt('Service du nouveau rôle (identifiant) :\n'+options));
        if(!Number.isSafeInteger(service_id)||service_id<1)return notify('Affectation obligatoire.');
      }
      await api(`/utilisateurs/${id}`,{method:'PATCH',body:JSON.stringify({role,actif:!!agent.actif,service_id})});
    }else if(operation==='toggle'){
      if(!confirm(`${agent.actif?'Désactiver':'Activer'} le compte de ${agent.nom} ?`))return;
      await api(`/utilisateurs/${id}`,{method:'PATCH',body:JSON.stringify({role:agent.role,actif:!agent.actif,service_id:agent.service_id})});
    }else if(operation==='password'){
      const nouveau=prompt(`Nouveau mot de passe (12 caractères minimum) pour ${agent.nom} :`);
      if(!nouveau)return;
      await api(`/utilisateurs/${id}/reset-password`,{method:'POST',body:JSON.stringify({nouveau})});
    }
    await refreshServer();notify('Compte mis à jour.');
  }catch(e){notify('Erreur : '+e.message);}
}
function signOut(){
  sessionStorage.removeItem('prefecta_token');state.user=null;state.dossiers=[];state.agents=[];state.services=[];state.journal=[];
  $('account-name').textContent='Non connecté';$('account-sub').textContent='Session fermée';
  renderAll();$('login-password').value='';$('login-overlay').hidden=false;
  if(state.page!=='dashboard'){location.assign('/src/pages/tableau-de-bord.html');return;}
  notify('Session fermée.');
}
function goPage(name){
  if(['agents','journal'].includes(name)&&state.user?.role!=='Administrateur')return notify('Accès réservé à l’administrateur.');
  if(PAGE_URLS[name])location.assign('/src/pages/'+PAGE_URLS[name]);
}
function openModal(id=null){const d=state.dossiers.find(x=>Number(x.id)===Number(id));if(id!==null&&!d){notify('Dossier indisponible dans votre liste.');return;}state.editing=id;$('modal-title').textContent=d?'Modifier le dossier':'Nouveau dossier';$('dossier-id').value=d?d.id:'';$('field-demandeur').value=d?d.demandeur:'';$('field-objet').value=d?d.objet:'';$('field-service').value=d?d.service:'';$('field-categorie').value=d?d.categorie:'Demande d’attestation';$('field-statut').value=d?d.statut:'Reçu';$('field-priorite').value=d?d.priorite:'Normale';$('field-description').value=d?d.description||'':'';$('modal-overlay').hidden=false;document.body.style.overflow='hidden';setTimeout(()=>$('field-demandeur').focus(),20);}
function closeModal(){$('modal-overlay').hidden=true;document.body.style.overflow='';}
async function saveForm(ev){
 ev.preventDefault();const id=$('dossier-id').value;
 const record={demandeur:$('field-demandeur').value.trim(),objet:$('field-objet').value.trim(),service:$('field-service').value,categorie:$('field-categorie').value,statut:$('field-statut').value,priorite:$('field-priorite').value,description:$('field-description').value.trim()};
 if(!record.demandeur||!record.objet||!SERVICES.includes(record.service))return notify('Complète les champs obligatoires.');
 const btn=$('save-dossier');btn.disabled=true;
 try{await api(id?`/dossiers/${id}`:'/dossiers',{method:id?'PUT':'POST',body:JSON.stringify(record)});await refreshServer();closeModal();notify(id?'Dossier mis à jour.':'Dossier enregistré dans MySQL.');}
 catch(e){notify('Erreur : '+e.message);}finally{btn.disabled=false;}
}
function csvEscape(v){let s=String(v??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"';}
function exportCsv(){const cols=['numero','demandeur','objet','service','categorie','statut','priorite','description','date_depot'];const content='\uFEFF'+cols.join(';')+'\r\n'+state.dossiers.map(d=>cols.map(c=>csvEscape(d[c])).join(';')).join('\r\n');const blob=new Blob([content],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='prefecta_export_dossiers.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);notify('Export CSV préparé à partir des données autorisées.');}
async function addAgent(){
 if(state.user?.role!=='Administrateur')return notify('Réservé aux administrateurs.');
 const nom=prompt('Nom complet du nouvel utilisateur :');if(!nom)return;
 const email=prompt('Adresse e-mail de connexion :');if(!email||!/^\S+@\S+\.\S+$/.test(email))return notify('Adresse e-mail invalide.');
 const password=prompt('Mot de passe initial (12 caractères minimum) :');if(!password||password.length<12)return notify('Mot de passe trop court.');
 const role=prompt('Rôle (Administrateur, Agent, Lecteur) :','Agent');if(!['Administrateur','Agent','Lecteur'].includes(role))return notify('Rôle invalide.');
 let service_id=null;
 if(role!=='Administrateur'){
   const choices=state.services.filter(s=>s.actif).map(s=>`${s.id} : ${s.nom}`).join('\n');
   service_id=Number(prompt('Service de rattachement (numéro) :\n'+choices));
   if(!Number.isSafeInteger(service_id)||service_id<1)return notify('Affectation obligatoire.');
 }
 try{await api('/utilisateurs',{method:'POST',body:JSON.stringify({nom,email,password,role,service_id})});await refreshServer();notify('Compte créé dans MySQL.');}
 catch(e){notify('Erreur : '+e.message);}
}
async function addService(){
 if(state.user?.role!=='Administrateur')return;
 const nom=prompt('Nom du nouveau service :');if(!nom)return;
 const description=prompt('Description (facultative) :')||'';
 try{await api('/services',{method:'POST',body:JSON.stringify({nom,description})});await refreshServer();notify('Service créé dans MySQL.');}
 catch(e){notify('Erreur : '+e.message);}
}
async function editService(id,toggle=false){
 if(state.user?.role!=='Administrateur')return;
 const srv=state.services.find(s=>Number(s.id)===Number(id));if(!srv)return;
 let nom=srv.nom,description=srv.description,actif=!!srv.actif;
 if(toggle){if(!confirm(`${actif?'Désactiver':'Réactiver'} le service « ${nom} » ?`))return;actif=!actif;}
 else{nom=prompt('Nom du service :',srv.nom);if(!nom)return;description=prompt('Description :',srv.description||'')||'';}
 try{await api(`/services/${id}`,{method:'PATCH',body:JSON.stringify({nom,description,actif})});await refreshServer();notify('Service mis à jour.');}
 catch(e){notify('Erreur : '+e.message);}
}
function wire(){
 document.addEventListener('click',e=>{
   const nav=e.target.closest('.nav-item[data-page]');
   if(nav&&['agents','journal'].includes(nav.dataset.page)&&state.user?.role!=='Administrateur'){
     e.preventDefault();notify('Accès réservé à l’administrateur.');return;
   }
   const g=e.target.closest('[data-goto]');if(g)goPage(g.dataset.goto);
   const edit=e.target.closest('[data-edit]');if(edit)openModal(Number(edit.dataset.edit));
   const p=e.target.closest('[data-page-index]');if(p){state.pageIndex=Number(p.dataset.pageIndex);renderDossiers();}
   const urole=e.target.closest('[data-agent-role]');if(urole)editAgent(urole.dataset.agentRole,'role');
   const utoggle=e.target.closest('[data-agent-toggle]');if(utoggle)editAgent(utoggle.dataset.agentToggle,'toggle');
   const upass=e.target.closest('[data-agent-password]');if(upass)editAgent(upass.dataset.agentPassword,'password');
   const userService=e.target.closest('[data-agent-service]');if(userService)editAgent(userService.dataset.agentService,'service');
   const srvEdit=e.target.closest('[data-service-edit]');if(srvEdit)editService(srvEdit.dataset.serviceEdit);
   const srvToggle=e.target.closest('[data-service-toggle]');if(srvToggle)editService(srvToggle.dataset.serviceToggle,true);
 });
 const on=(id,event,handler)=>{const el=$(id);if(el)el.addEventListener(event,handler);};
 on('dashboard-add','click',()=>openModal());
 on('dossier-add','click',()=>openModal());
 on('detail-print','click',()=>window.print());
 on('close-modal','click',closeModal);
 on('cancel-modal','click',closeModal);
 on('modal-overlay','click',e=>{if(e.target===$('modal-overlay'))closeModal();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('modal-overlay').hidden)closeModal();});
 on('dossier-form','submit',saveForm);
 on('dossier-search','input',()=>{state.pageIndex=1;renderDossiers();});
 on('filter-status','change',()=>{state.pageIndex=1;renderDossiers();});
 on('filter-service','change',()=>{state.pageIndex=1;renderDossiers();});
 ['export-csv','reports-export','reports-export-2'].forEach(id=>on(id,'click',exportCsv));
 on('add-agent','click',addAgent);
 on('add-service','click',addService);
 on('menu-btn','click',()=>{$('sidebar').classList.add('open');$('sidebar-backdrop').hidden=false;});
 on('sidebar-backdrop','click',()=>{$('sidebar').classList.remove('open');$('sidebar-backdrop').hidden=true;});
 ['account-btn','top-avatar'].forEach(id=>on(id,'click',()=>goPage('parametres')));
 on('refresh-journal','click',refreshJournal);
 on('logout-btn','click',signOut);
 on('password-form','submit',async e=>{
   e.preventDefault();
   const ancien=$('password-old').value,nouveau=$('password-new').value;
   if(nouveau!==$('password-confirm').value)return notify('La confirmation ne correspond pas.');
   if(nouveau.length<12)return notify('12 caractères minimum.');
   try{
     await api('/auth/change-password',{method:'POST',body:JSON.stringify({ancien,nouveau})});
     $('password-form').reset();notify('Mot de passe modifié. Reconnecte-toi.');signOut();
   }catch(err){notify('Erreur : '+err.message);}
 });
 on('login-form','submit',async e=>{
   e.preventDefault();$('login-error').textContent='';
   const button=e.target.querySelector('button[type=submit]');button.disabled=true;
   try{
     const {token,user}=await api('/auth/login',{method:'POST',body:JSON.stringify({email:$('login-email').value,password:$('login-password').value})});
     sessionStorage.setItem('prefecta_token',token);state.user=user;
     if(['agents','journal'].includes(state.page)&&user.role!=='Administrateur'){location.replace('/src/pages/tableau-de-bord.html');return;}
     $('account-name').textContent=user.nom;$('account-sub').textContent=user.role;$('login-overlay').hidden=true;
     await refreshServer();notify('Connexion réussie.');
   }catch(err){$('login-error').textContent=err.message;}finally{button.disabled=false;}
 });
}

startup();
})();
