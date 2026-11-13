'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {validateDossier,canWriteService,canEditService,isId}=require('../utils/rules');
const form={demandeur:'Test',objet:'Attestation',service:'État civil',categorie:'Demande d’attestation',statut:'Reçu',priorite:'Normale'};
test('un dossier valide est accepté',()=>assert.equal(validateDossier(form).error,undefined));
test('un service vide est rejeté',()=>assert.match(validateDossier({...form,service:''}).error,/invalides/));
test('un statut inconnu est rejeté',()=>assert.ok(validateDossier({...form,statut:'Terminé'}).error));
test('validation des identifiants stricts',()=>{assert.equal(isId(1),true); assert.equal(isId(0),false); assert.equal(isId('abc'),false);});
test('administrateur peut écrire dans tous les services',()=>assert.equal(canWriteService({role:'Administrateur'},999),true));
test('agent seulement dans son service',()=>{assert.equal(canWriteService({role:'Agent',service_id:2},2),true);assert.equal(canWriteService({role:'Agent',service_id:2},1),false);});
test('lecteur ne peut pas écrire',()=>assert.equal(canWriteService({role:'Lecteur',service_id:2},2),false));
test('agent ne peut pas transférer un dossier vers un autre service',()=>{
 const agent={role:'Agent',service_id:2};
 assert.equal(canEditService(agent,'État civil','État civil','État civil'),true);
 assert.equal(canEditService(agent,'Archives','État civil','État civil'),false);
 assert.equal(canEditService(agent,'État civil','Archives','État civil'),false);
});
