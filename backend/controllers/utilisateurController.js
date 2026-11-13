'use strict';

const db=require('../config/database');
const bcrypt=require('bcryptjs');
const {isId,trim,ROLES}=require('../utils/rules');
const {fail,audit}=require('../utils/helpers');

const list = async(req,res,next)=>{try{if(req.user.role!=='Administrateur'){const [r]=await db.execute('SELECT id,nom,email,role,actif,service_id FROM utilisateurs WHERE id=?',[req.user.id]);return res.json(r);}const [rows]=await db.query('SELECT id,nom,email,role,actif,service_id FROM utilisateurs ORDER BY id');res.json(rows);}catch(e){next(e);}};

const create = async(req,res,next)=>{try{
 const nom=trim(req.body?.nom,120),email=trim(req.body?.email,180).toLowerCase();
 const password=req.body?.password,role=req.body?.role,serviceId=req.body?.service_id;
 if(!nom||!/^\S+@\S+\.\S+$/.test(email)||typeof password!=='string'||password.length<12||password.length>128||!ROLES.includes(role))return fail(res,400,'Données de l’agent invalides.');
 if(role!=='Administrateur'&&!isId(serviceId))return fail(res,400,'Affectation à un service obligatoire.');
 if(role!=='Administrateur'){
  const [srv]=await db.execute('SELECT id FROM services WHERE id=? AND actif=1',[serviceId]);
  if(!srv.length)return fail(res,400,'Service inconnu ou inactif.');
 }
 const hash=await bcrypt.hash(password,12);
 const [r]=await db.execute('INSERT INTO utilisateurs(nom,email,mot_de_passe_hash,role,service_id) VALUES(?,?,?,?,?)',[nom,email,hash,role,role==='Administrateur'?null:Number(serviceId)]);
 await audit(req.user.id,'AJOUT_AGENT',null,`Compte #${r.insertId} créé (${role})`);
 res.status(201).json({id:r.insertId,nom,email,role,actif:1,service_id:role==='Administrateur'?null:Number(serviceId)});
}catch(e){if(e.code==='ER_DUP_ENTRY')return fail(res,409,'Cet e-mail est déjà utilisé.');next(e);}};

const update = async(req,res,next)=>{
  try{
    if(!isId(req.params.id))return fail(res,400,'Identifiant incorrect.');
    const id=Number(req.params.id);
    const role=req.body?.role,actif=req.body?.actif,serviceId=req.body?.service_id;
    if(!ROLES.includes(role)||![true,false].includes(actif))return fail(res,400,'Rôle ou statut invalide.');
    if(role!=='Administrateur'&&!isId(serviceId))return fail(res,400,'Service obligatoire pour ce rôle.');
    if(role!=='Administrateur'){const [sr]=await db.execute('SELECT id FROM services WHERE id=? AND actif=1',[serviceId]);if(!sr.length)return fail(res,400,'Service inactif ou introuvable.');}
    if(id===Number(req.user.id)&&(!actif||role!=='Administrateur'))
      return fail(res,400,'Tu ne peux pas désactiver ton propre compte administrateur.');
    const [existing]=await db.execute('SELECT role,actif FROM utilisateurs WHERE id=?',[id]);
    if(!existing[0])return fail(res,404,'Utilisateur introuvable.');
    if(existing[0].role==='Administrateur'&&existing[0].actif&&(!actif||role!=='Administrateur')){
      const [n]=await db.query("SELECT COUNT(*) AS total FROM utilisateurs WHERE role='Administrateur' AND actif=1");
      if(n[0].total<=1)return fail(res,400,'Il faut conserver au moins un administrateur actif.');
    }
    await db.execute('UPDATE utilisateurs SET role=?,actif=?,service_id=?,token_version=token_version+1 WHERE id=?',[role,actif?1:0,role==='Administrateur'?null:Number(serviceId),id]);
    await audit(req.user.id,'ACCES',null,`Compte #${id} : ${role}, actif=${actif}`);
    res.json({ok:true});
  }catch(e){next(e);}
};

const resetPassword = async(req,res,next)=>{
  try{
    if(!isId(req.params.id))return fail(res,400,'Identifiant incorrect.');
    const nouveau=req.body?.nouveau;
    if(typeof nouveau!=='string'||nouveau.length<12||nouveau.length>128)
      return fail(res,400,'Nouveau mot de passe de 12 à 128 caractères requis.');
    const hash=await bcrypt.hash(nouveau,12);
    const [r]=await db.execute('UPDATE utilisateurs SET mot_de_passe_hash=?,token_version=token_version+1 WHERE id=?',[hash,Number(req.params.id)]);
    if(!r.affectedRows)return fail(res,404,'Utilisateur introuvable.');
    await audit(req.user.id,'REINITIALISATION',null,`Mot de passe réinitialisé pour le compte #${Number(req.params.id)}`);
    res.json({ok:true});
  }catch(e){next(e);}
};

module.exports={list,create,update,resetPassword};
