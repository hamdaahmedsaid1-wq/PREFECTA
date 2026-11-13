'use strict';
require('dotenv').config();
const db=require('../config/database');
async function main(){
 const [tables]=await db.query("SELECT TABLE_NAME AS name FROM information_schema.TABLES WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME IN ('dossiers','utilisateurs','journal_activite','services')");
 const have=tables.map(x=>x.name);
 for(const n of ['dossiers','utilisateurs','journal_activite','services'])if(!have.includes(n))throw Error('Table absente : '+n);
 const [[d]]=await db.query('SELECT COUNT(*) AS n FROM dossiers');
 const [[u]]=await db.query('SELECT COUNT(*) AS n FROM utilisateurs');
 const [[s]]=await db.query('SELECT COUNT(*) AS n FROM services');
 const [[a]]=await db.query("SELECT COUNT(*) AS n FROM utilisateurs WHERE role IN ('Agent','Lecteur') AND actif=1 AND service_id IS NULL");
 console.log(`Base MySQL connectée. ${d.n} dossiers, ${u.n} comptes et ${s.n} services.`);
 if(Number(a.n))console.log(`IMPORTANT : ${a.n} agent(s)/lecteur(s) sans service. Affecte-les dans Agents et accès.`);
 console.log('Diagnostic de structure terminé (ne remplace pas les tests de sécurité).');
}
main().catch(e=>{console.error('Erreur diagnostic :',e.message);process.exitCode=1;}).finally(()=>db.end());
