'use strict';
const jwt=require('jsonwebtoken');
const db=require('../config/database');
const {isId}=require('../utils/rules');
const {fail}=require('../utils/helpers');
async function auth(req,res,next){
  const header=req.headers.authorization||'';
  const token=header.startsWith('Bearer ')?header.slice(7):null;
  if(!token)return fail(res,401,'Authentification requise.');
  let claims;
  try{claims=jwt.verify(token,process.env.JWT_SECRET,{algorithms:['HS256']});}
  catch(e){return fail(res,401,'Session expirée ou invalide.');}
  if(!isId(claims.id))return fail(res,401,'Session invalide.');
  try{
    const [rows]=await db.execute('SELECT id,nom,email,role,actif,service_id,token_version FROM utilisateurs WHERE id=? LIMIT 1',[Number(claims.id)]);
    const user=rows[0];
    if(!user||!user.actif||Number(user.token_version)!==Number(claims.ver))
      return fail(res,401,'Compte désactivé ou session invalidée.');
    req.user={id:user.id,nom:user.nom,email:user.email,role:user.role,service_id:user.service_id};
    next();
  }catch(e){next(e);}
}
function requireRole(...roles){
  return (req,res,next)=>roles.includes(req.user?.role)?next():fail(res,403,'Accès non autorisé pour ce rôle.');
}
module.exports={auth,requireRole};
