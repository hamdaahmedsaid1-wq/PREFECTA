'use strict';

const db=require('../config/database');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const {trim}=require('../utils/rules');
const {fail,audit}=require('../utils/helpers');

const login = async(req,res,next)=>{try{const email=trim(req.body?.email,180).toLowerCase();const password=req.body?.password;if(!email||typeof password!=='string')return fail(res,400,'Identifiants manquants.');const [rows]=await db.execute('SELECT id,nom,email,mot_de_passe_hash,role,actif,token_version,service_id FROM utilisateurs WHERE email=? LIMIT 1',[email]);const u=rows[0];if(!u||!u.actif||!(await bcrypt.compare(password,u.mot_de_passe_hash)))return fail(res,401,'E-mail ou mot de passe incorrect.');const user={id:u.id,nom:u.nom,email:u.email,role:u.role,service_id:u.service_id};const token=jwt.sign({id:u.id,ver:u.token_version},process.env.JWT_SECRET,{expiresIn:'8h',algorithm:'HS256'});res.json({token,user});}catch(e){next(e);}};

const me = async(req,res,next)=>{try{const [users]=await db.execute('SELECT id,nom,email,role,actif,service_id FROM utilisateurs WHERE id=?',[req.user.id]);const user=users[0];if(!user||!user.actif)return fail(res,401,'Compte désactivé.');res.json({id:user.id,nom:user.nom,email:user.email,role:user.role,service_id:user.service_id});}catch(e){next(e);}};

const changePassword = async(req,res,next)=>{
  try{
    const ancien=req.body?.ancien, nouveau=req.body?.nouveau;
    if(typeof ancien!=='string'||typeof nouveau!=='string'||nouveau.length<12||nouveau.length>128)
      return fail(res,400,'Ancien mot de passe et nouveau mot de passe (12 à 128 caractères) requis.');
    const [rows]=await db.execute('SELECT mot_de_passe_hash FROM utilisateurs WHERE id=?',[req.user.id]);
    if(!rows[0]||!await bcrypt.compare(ancien,rows[0].mot_de_passe_hash))
      return fail(res,401,'Ancien mot de passe incorrect.');
    const hash=await bcrypt.hash(nouveau,12);
    await db.execute('UPDATE utilisateurs SET mot_de_passe_hash=?,token_version=token_version+1 WHERE id=?',[hash,req.user.id]);
    await audit(req.user.id,'MOT_DE_PASSE',null,'Mot de passe du compte changé');
    res.json({ok:true});
  }catch(e){next(e);}
};

module.exports={login,me,changePassword};
