'use strict';
// Migration additive, idempotente. Elle n'efface aucun dossier ni utilisateur.
require('dotenv').config();
const db = require('../config/database');
async function columnExists(table, column) {
  const [rows] = await db.execute(`SELECT COUNT(*) AS n FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME=? AND COLUMN_NAME=?`,[table,column]);
  return Number(rows[0].n)>0;
}
async function run(){
  await db.query(`CREATE TABLE IF NOT EXISTS services (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(120) NOT NULL UNIQUE,
    description VARCHAR(250) NOT NULL DEFAULT '',
    actif TINYINT(1) NOT NULL DEFAULT 1,
    cree_le TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  // Convertit l'ancien ENUM en VARCHAR pour permettre des services administrables.
  const [c]=await db.execute(`SELECT COLUMN_TYPE FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=DATABASE() AND TABLE_NAME='dossiers' AND COLUMN_NAME='service'`);
  if(!c.length)throw Error('Table dossiers absente : importe d’abord database/schema.sql.');
  if(String(c[0].COLUMN_TYPE).startsWith('enum(')) await db.query(`ALTER TABLE dossiers MODIFY COLUMN service VARCHAR(120) NOT NULL`);
  await db.query(`INSERT IGNORE INTO services(nom) SELECT DISTINCT service FROM dossiers WHERE service<>''`);
  // Conserver les quatre noms existants si la base ne contient aucun dossier.
  for(const nom of ['Administration générale','État civil','Affaires sociales','Archives']){
    await db.execute('INSERT IGNORE INTO services(nom) VALUES(?)',[nom]);
  }
  if(!(await columnExists('utilisateurs','service_id'))) await db.query(`ALTER TABLE utilisateurs ADD COLUMN service_id INT UNSIGNED NULL`);
  if(!(await columnExists('utilisateurs','token_version'))) await db.query(`ALTER TABLE utilisateurs ADD COLUMN token_version INT UNSIGNED NOT NULL DEFAULT 0`);
  // Ne pas affecter arbitrairement un service aux agents existants : l'administrateur les affectera.
  console.log('Migration V3 terminée. Dossiers et utilisateurs conservés.');
  console.log('Affecter chaque agent existant à son service dans « Agents et accès » avant de lui donner accès aux dossiers.');
}
run().catch(e=>{console.error('Migration interrompue :',e.message);process.exitCode=1;}).finally(()=>db.end());
