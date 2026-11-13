'use strict';

const db=require('../config/database');

const list = async(req,res,next)=>{
  try{
    const [rows]=await db.query(`SELECT j.id,j.type_action,j.details,j.dossier_id,j.horodatage,
      u.nom AS agent, d.numero AS reference_dossier FROM journal_activite j
      LEFT JOIN utilisateurs u ON u.id=j.utilisateur_id
      LEFT JOIN dossiers d ON d.id=j.dossier_id
      ORDER BY j.horodatage DESC,j.id DESC LIMIT 150`);
    res.json(rows);
  }catch(e){next(e);}
};

module.exports={list};
