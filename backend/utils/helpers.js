'use strict';
const db = require('../config/database');
function fail(res,status,error){ return res.status(status).json({error}); }
async function audit(userId,action,dossierId,details,conn=db){
  await conn.execute('INSERT INTO journal_activite(utilisateur_id,type_action,dossier_id,details) VALUES(?,?,?,?)',
    [userId,action,dossierId,details||null]);
}
async function findService(nom,conn=db){
  const [rows] = await conn.execute('SELECT id,nom,actif FROM services WHERE nom=? LIMIT 1',[nom]);
  return rows[0]||null;
}
module.exports={fail,audit,findService};
