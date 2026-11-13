'use strict';
require('dotenv').config();
const express=require('express');
const helmet=require('helmet');
const path=require('path');
const fs=require('fs');
const app=express();
app.disable('x-powered-by');
app.use(helmet({contentSecurityPolicy:{directives:{
  defaultSrc:["'self'"],scriptSrc:["'self'"],styleSrc:["'self'","'unsafe-inline'",'https://fonts.googleapis.com'],
  fontSrc:["'self'",'https://fonts.gstatic.com'],imgSrc:["'self'",'data:'],connectSrc:["'self'"],
  objectSrc:["'none'"],frameAncestors:["'none'"]
}}}));
app.use(express.json({limit:'64kb'}));
app.use('/api',require('./routes/healthRoutes'));
app.use('/api/auth',require('./routes/authRoutes'));
app.use('/api/dossiers',require('./routes/dossierRoutes'));
app.use('/api/services',require('./routes/serviceRoutes'));
app.use('/api/utilisateurs',require('./routes/utilisateurRoutes'));
app.use('/api/journal',require('./routes/journalRoutes'));
app.use('/api',(req,res)=>res.status(404).json({error:'Route API inconnue.'}));

// Le frontend est servi par Express en production après npm run build dans frontend.
// En développement, utiliser Vite sur 5173 (proxy des API sur 3000).
const built=path.resolve(__dirname,'../frontend/dist');
const front=path.resolve(__dirname,'../frontend');
const root=fs.existsSync(path.join(built,'index.html'))?built:front;
app.use(express.static(root,{index:'index.html',maxAge:0}));
app.use((err,req,res,next)=>{
  console.error('Erreur PREFECTA :',err.message);
  if(res.headersSent)return next(err);
  res.status(500).json({error:'Erreur technique. Consulte le terminal Node.js.'});
});
module.exports=app;
