'use strict';
// Diagnostic local non destructif : n’affiche jamais le mot de passe ni son empreinte.
require('dotenv').config();
const bcrypt=require('bcryptjs');
const db=require('../config/database');
async function main(){
 const email=(process.env.SEED_ADMIN_EMAIL||'').trim().toLowerCase();
 const password=process.env.SEED_ADMIN_PASSWORD;
 const [admins]=await db.query("SELECT id,email,actif,mot_de_passe_hash FROM utilisateurs WHERE role='Administrateur' ORDER BY id");
 console.log('Administrateurs enregistrés : '+admins.length);
 if(!admins.length){console.log('Aucun compte administrateur trouvé.');return;}
 for(const a of admins){
   console.log(`- ID ${a.id}, e-mail ${a.email}, actif=${Boolean(a.actif)}`);
   if(a.email.toLowerCase()===email){
     console.log('  Adresse du .env : correspondante');
     if(typeof password==='string'&&password.length){
       console.log('  Mot de passe du .env : '+(await bcrypt.compare(password,a.mot_de_passe_hash)?'CORRESPOND':'NE CORRESPOND PAS'));
     } else console.log('  Aucun mot de passe dans .env');
   }
 }
 if(!admins.some(a=>a.email.toLowerCase()===email))console.log('ATTENTION : SEED_ADMIN_EMAIL ne correspond à aucun administrateur dans MySQL.');
 console.log('Cette commande ne modifie aucune donnée.');
}
main().catch(e=>{console.error('Erreur diagnostic :',e.message);process.exitCode=1;}).finally(()=>db.end());
