'use strict';
require('dotenv').config();
const app=require('./app');
const db=require('./config/database');
const PORT=Number(process.env.PORT)||3000;
const secret=process.env.JWT_SECRET;
if(!secret||secret.length<48||secret.startsWith('REMPLACER_')){
  console.error('ERREUR : configurer JWT_SECRET (48 caractères minimum) dans backend/.env');
  process.exit(1);
}
(async()=>{
  try{
    await db.query('SELECT 1 FROM services LIMIT 1');
    await db.query('SELECT service_id,token_version FROM utilisateurs LIMIT 1');
    const server=app.listen(PORT,'127.0.0.1',()=>console.log(`PREFECTA — API sur http://127.0.0.1:${PORT}`));
    server.on('error',err=>{
      console.error(err.code==='EADDRINUSE'?`Port ${PORT} déjà utilisé. Arrête l'ancien serveur.`:err.message);
      process.exitCode=1;
    });
  }catch(e){
    console.error('Base non migrée ou inaccessible. Exécute npm run migrate :',e.message);
    process.exitCode=1;await db.end();
  }
})();
