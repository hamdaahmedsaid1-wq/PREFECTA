'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {canReadService}=require('../utils/rules');

test('administrateur peut consulter tous les dossiers',()=>{
  assert.equal(canReadService({role:'Administrateur'},'Archives',undefined),true);
});
test('agent affecté ne consulte que son service',()=>{
  const user={role:'Agent',service_id:2};
  assert.equal(canReadService(user,'État civil','État civil'),true);
  assert.equal(canReadService(user,'Archives','État civil'),false);
});
test('lecteur est restreint à son service',()=>{
  const user={role:'Lecteur',service_id:3};
  assert.equal(canReadService(user,'Affaires sociales','Affaires sociales'),true);
  assert.equal(canReadService(user,'État civil','Affaires sociales'),false);
});
test('agent non affecté ne lit pas de dossier',()=>{
  assert.equal(canReadService({role:'Agent',service_id:null},'Archives','Archives'),false);
  assert.equal(canReadService({role:'Agent',service_id:1},'Archives',undefined),false);
});

// Un faux adaptateur SQL permet de tester les contrôleurs sans toucher à la base locale.
const dbPath=require.resolve('../config/database');
require.cache[dbPath]={id:dbPath,filename:dbPath,loaded:true,exports:{
  execute:async(sql,params)=>{
    if(sql.includes('FROM dossiers d'))return [[{
      id:1,numero:'AS-2026-0001',service:'État civil',demandeur:'Exemple',objet:'Attestation'
    }]];
    if(sql.includes('FROM services WHERE'))return [[{nom:Number(params[0])===2?'État civil':'Archives'}]];
    if(sql.includes('FROM journal_activite j'))return [[{id:7,type_action:'CREATION',details:'Création du dossier',agent:'Admin'}]];
    throw new Error('SQL inattendu : '+sql);
  }
}};
const ctrl=require('../controllers/dossierController');
function response(){return {code:200,body:null,headers:{},status(n){this.code=n;return this;},set(key,val){this.headers[key]=val;return this;},json(obj){this.body=obj;return this;}};}
async function invoke(fn,role,service_id,id='1'){
  const req={params:{id},user:{id:1,role,service_id}};
  const res=response();let error;
  await fn(req,res,e=>{error=e;});
  if(error)throw error;
  return res;
}
test('API fiche : administrateur obtient la fiche',async()=>{
  const res=await invoke(ctrl.getOne,'Administrateur',null);
  assert.equal(res.code,200);assert.equal(res.body.numero,'AS-2026-0001');
  assert.equal(res.headers['Cache-Control'],'no-store');
});
test('API fiche : agent affecté à un autre service reçoit 404',async()=>{
  const res=await invoke(ctrl.getOne,'Agent',3);
  assert.equal(res.code,404);
});
test('API fiche : agent affecté lit la fiche',async()=>{
  const res=await invoke(ctrl.getOne,'Agent',2);
  assert.equal(res.code,200);
});
test('API fiche : id incorrect reçoit 400',async()=>{
  const res=await invoke(ctrl.getOne,'Administrateur',null,'abc');
  assert.equal(res.code,400);
});
test('API historique : filtre le service côté serveur',async()=>{
  const refused=await invoke(ctrl.history,'Lecteur',4);
  assert.equal(refused.code,404);
  const ok=await invoke(ctrl.history,'Lecteur',2);
  assert.equal(ok.code,200);assert.equal(ok.body[0].type_action,'CREATION');
});
