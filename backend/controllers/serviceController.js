'use strict';

const db=require('../config/database');
const {isId,trim}=require('../utils/rules');
const {fail,audit,findService}=require('../utils/helpers');

const list = async(req,res,next)=>{try{
  const [rows]=await db.query('SELECT id,nom,description,actif FROM services ORDER BY nom');
  res.json(req.user.role==='Administrateur'?rows:rows.filter(x=>x.actif));
}catch(e){next(e);}};

const create = async(req,res,next)=>{try{
  const nom=trim(req.body?.nom,120),description=trim(req.body?.description,250);
  if(nom.length<2)return fail(res,400,'Nom du service requis (2 caractères minimum).');
  const [r]=await db.execute('INSERT INTO services(nom,description) VALUES(?,?)',[nom,description]);
  await audit(req.user.id,'SERVICE_CREATION',null,`Service #${r.insertId} créé`);
  res.status(201).json({id:r.insertId,nom,description,actif:1});
}catch(e){if(e.code==='ER_DUP_ENTRY')return fail(res,409,'Un service porte déjà ce nom.');next(e);}};

const update = async(req,res,next)=>{
  const id=Number(req.params.id); if(!isId(id))return fail(res,400,'Identifiant incorrect.');
  const nom=trim(req.body?.nom,120),description=trim(req.body?.description,250),actif=req.body?.actif;
  if(nom.length<2||typeof actif!=='boolean')return fail(res,400,'Nom ou statut incorrect.');
  const conn=await db.getConnection();
  try{
    await conn.beginTransaction();
    const [rows]=await conn.execute('SELECT * FROM services WHERE id=? FOR UPDATE',[id]);
    if(!rows.length){await conn.rollback();return fail(res,404,'Service introuvable.');}
    const old=rows[0];
    if(!actif){
      const [[n]]=await conn.execute("SELECT COUNT(*) AS total FROM dossiers WHERE service=? AND statut<>'Archivé'",[old.nom]);
      const [[a]]=await conn.execute('SELECT COUNT(*) AS total FROM utilisateurs WHERE service_id=? AND actif=1',[id]);
      if(Number(n.total)>0||Number(a.total)>0){await conn.rollback();return fail(res,409,'Impossible de désactiver un service possédant des dossiers non archivés ou des agents actifs.');}
    }
    await conn.execute('UPDATE services SET nom=?,description=?,actif=? WHERE id=?',[nom,description,actif?1:0,id]);
    if(old.nom!==nom)await conn.execute('UPDATE dossiers SET service=? WHERE service=?',[nom,old.nom]);
    await audit(req.user.id,'SERVICE_MODIFICATION',null,`Service #${id} modifié`,conn);
    await conn.commit();res.json({ok:true});
  }catch(e){await conn.rollback();if(e.code==='ER_DUP_ENTRY')return fail(res,409,'Nom de service déjà utilisé.');next(e);}finally{conn.release();}
};

module.exports={list,create,update};
