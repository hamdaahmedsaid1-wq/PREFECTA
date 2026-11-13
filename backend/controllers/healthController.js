'use strict';

const db=require('../config/database');

const health = async(req,res)=>{try{await db.query('SELECT 1');res.json({status:'ok',service:'PREFECTA local',version:'3.1.3'});}catch(e){res.status(503).json({status:'error',error:'Base MySQL non disponible'});}};

module.exports={health};
