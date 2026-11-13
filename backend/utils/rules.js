'use strict';
const CATEGORIES=['Demande d’attestation','Courrier administratif','Réclamation','Autre'];
const STATUS=['Reçu','En cours','Validé','Rejeté','Archivé'];
const PRIORITIES=['Normale','Urgente'];
const ROLES=['Administrateur','Agent','Lecteur'];
function isId(v){return v!==null&&v!==undefined&&v!==''&&Number.isSafeInteger(Number(v))&&Number(v)>0;}
function trim(v,max){return typeof v==='string'?v.trim().slice(0,max):'';}
function validateDossier(obj={}){
  const v={demandeur:trim(obj.demandeur,120),objet:trim(obj.objet,180),service:obj.service,
    categorie:obj.categorie,statut:obj.statut,priorite:obj.priorite,description:trim(obj.description,1000)};
  if(!v.demandeur||!v.objet) return {error:'Nom du demandeur et objet obligatoires.'};
  if(typeof v.service!=='string'||!v.service.trim()||v.service.length>120||
      !CATEGORIES.includes(v.categorie)||!STATUS.includes(v.statut)||!PRIORITIES.includes(v.priorite))
    return {error:'Valeurs de sélection invalides.'};
  return {value:v};
}
function canWriteService(user, serviceId){
  return user?.role==='Administrateur'||(user?.role==='Agent'&&isId(user.service_id)&&Number(user.service_id)===Number(serviceId));
}
function canEditService(user, originalServiceName, targetServiceName, assignedServiceName){
  return user?.role==='Administrateur'||(user?.role==='Agent'&&!!assignedServiceName&&
     assignedServiceName===originalServiceName&&assignedServiceName===targetServiceName);
}
module.exports={CATEGORIES,STATUS,PRIORITIES,ROLES,isId,trim,validateDossier,canWriteService,canEditService};
