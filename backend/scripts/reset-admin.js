'use strict';
// Récupération locale : opérateur possédant l'accès aux secrets ET à la base MySQL.
// Ne touche ni aux dossiers ni aux autres comptes utilisateurs.
require('dotenv').config();
const db=require('../config/database');
const bcrypt=require('bcryptjs');
async function run(){
  const configured=(process.env.SEED_ADMIN_EMAIL||'').trim().toLowerCase();
  const password=process.env.SEED_ADMIN_PASSWORD;
  if(typeof password!=='string'||password.length<12||password.length>128)
    throw Error('SEED_ADMIN_PASSWORD doit comporter entre 12 et 128 caractères.');
  const [admins]=await db.query("SELECT id,email,actif FROM utilisateurs WHERE role='Administrateur' ORDER BY id");
  if(!admins.length)throw Error('Aucun administrateur présent en base. Ne pas relancer seed sur une base existante ; vérifier la table utilisateurs.');
  let target=admins.find(a=>a.email.toLowerCase()===configured);
  if(!target&&admins.length===1){
    target=admins[0];
    console.warn('Attention : SEED_ADMIN_EMAIL ne correspond pas à la base.');
    console.warn('Un seul compte administrateur existe ; restauration de ce compte : '+target.email);
    console.warn('Son adresse e-mail n’est PAS modifiée. Utiliser cette adresse pour se connecter.');
  }
  if(!target){
    console.error('Administrateurs présents : '+admins.map(a=>a.email).join(', '));
    throw Error('Plusieurs administrateurs : SEED_ADMIN_EMAIL doit correspondre exactement à l’un d’eux.');
  }
  const hash=await bcrypt.hash(password,12);
  const [r]=await db.execute("UPDATE utilisateurs SET mot_de_passe_hash=?,token_version=token_version+1 WHERE id=? AND role='Administrateur'",[hash,target.id]);
  if(r.affectedRows!==1)throw Error('Mise à jour non effectuée.');
  console.log('Mot de passe mis à jour pour '+target.email+' ; sessions antérieures invalidées.');
  console.log('Dossiers, services et autres utilisateurs non modifiés.');
}
run().catch(e=>{console.error('Erreur :',e.message);process.exitCode=1;}).finally(()=>db.end());
