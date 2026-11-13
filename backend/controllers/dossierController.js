'use strict';

const db=require('../config/database');
const {isId,validateDossier,canWriteService,canEditService}=require('../utils/rules');
const {fail,audit,findService}=require('../utils/helpers');

const list = async(req,res,next)=>{try{
  if(req.user.role!=='Administrateur'&&!req.user.service_id)return res.json([]);
  const sql='SELECT id,numero,demandeur,objet,service,categorie,statut,priorite,description,date_depot FROM dossiers';
  const [rows]=req.user.role==='Administrateur'?
    await db.query(sql+' ORDER BY date_depot DESC,id DESC LIMIT 10000'):
    await db.execute(sql+' WHERE service=(SELECT nom FROM services WHERE id=?) ORDER BY date_depot DESC,id DESC LIMIT 10000',[req.user.service_id]);
  res.json(rows);
}catch(e){next(e);}};

const create = async(req,res,next)=>{
  const {value,error}=validateDossier(req.body||{});if(error)return fail(res,400,error);
  const conn=await db.getConnection();
  try{
    await conn.beginTransaction();
    const service=await findService(value.service,conn);
    if(!service||!service.actif){await conn.rollback();return fail(res,400,'Service inexistant ou inactif.');}
    if(!canWriteService(req.user, service.id)){
      await conn.rollback();return fail(res,403,'Un agent ne peut créer un dossier que dans son service affecté.');
    }
    const [result]=await conn.execute('INSERT INTO dossiers(demandeur,objet,service,categorie,statut,priorite,description,date_depot,cree_par) VALUES(?,?,?,?,?,?,?,CURDATE(),?)',[value.demandeur,value.objet,value.service,value.categorie,value.statut,value.priorite,value.description,req.user.id]);
    const numero=`AS-${new Date().getFullYear()}-${String(result.insertId).padStart(4,'0')}`;
    await conn.execute('UPDATE dossiers SET numero=? WHERE id=?',[numero,result.insertId]);
    await audit(req.user.id,'CREATION',result.insertId,'Création du dossier',conn);
    await conn.commit();res.status(201).json({id:result.insertId,numero});
  }catch(e){await conn.rollback();next(e);}finally{conn.release();}
};

const update = async(req,res,next)=>{
  const id=Number(req.params.id);if(!isId(id))return fail(res,400,'Identifiant incorrect.');
  const {value,error}=validateDossier(req.body||{});if(error)return fail(res,400,error);
  const conn=await db.getConnection();
  try{
    await conn.beginTransaction();
    const [old]=await conn.execute('SELECT id,service FROM dossiers WHERE id=? FOR UPDATE',[id]);
    if(!old.length){await conn.rollback();return fail(res,404,'Dossier introuvable.');}
    const service=await findService(value.service,conn);
    if(!service||!service.actif){await conn.rollback();return fail(res,400,'Service inexistant ou inactif.');}
    if(req.user.role==='Agent'){
      const [assigned]=await conn.execute('SELECT nom FROM services WHERE id=?',[req.user.service_id||0]);
      if(!canEditService(req.user,old[0].service,value.service,assigned[0]?.nom)){
        await conn.rollback();return fail(res,403,'Modification hors de votre service interdite.');
      }
    }
    await conn.execute('UPDATE dossiers SET demandeur=?,objet=?,service=?,categorie=?,statut=?,priorite=?,description=? WHERE id=?',[value.demandeur,value.objet,value.service,value.categorie,value.statut,value.priorite,value.description,id]);
    await audit(req.user.id,'MODIFICATION',id,'Modification du dossier',conn);
    await conn.commit();res.json({ok:true,id});
  }catch(e){await conn.rollback();next(e);}finally{conn.release();}
};

module.exports={list,create,update};
