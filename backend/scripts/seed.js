'use strict';
// Première installation uniquement : crée l'administrateur sans générer de dossiers fictifs.
require('dotenv').config();
const db=require('../config/database');
const bcrypt=require('bcryptjs');
async function run(){
 const email=(process.env.SEED_ADMIN_EMAIL||'').trim().toLowerCase();
 const password=process.env.SEED_ADMIN_PASSWORD;
 if(!/^\S+@\S+\.\S+$/.test(email)||!password||password.length<12) throw Error('SEED_ADMIN_EMAIL et SEED_ADMIN_PASSWORD de 12 caractères requis dans .env');
 const [r]=await db.query('SELECT COUNT(*) AS n FROM utilisateurs');
 if(Number(r[0].n)>0){console.log('Utilisateurs existants : aucune modification ni création.');return;}
 const hash=await bcrypt.hash(password,12);
 await db.execute('INSERT INTO utilisateurs(nom,email,mot_de_passe_hash,role) VALUES(?,?,?,?)',['Administrateur',email,hash,'Administrateur']);
 console.log('Compte administrateur initial créé. Aucun dossier d’exemple ajouté.');
}
run().catch(e=>{console.error(e.message);process.exitCode=1;}).finally(()=>db.end());
