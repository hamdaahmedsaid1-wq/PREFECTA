'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const front=path.resolve(__dirname,'../../frontend');
test('entrée Vite créée',()=>assert.ok(fs.existsSync(path.join(front,'vite.config.js'))));
for(const [page,id] of Object.entries({'tableau-de-bord':'dashboard','dossiers':'dossiers','dossier-detail':'detail','services':'services','rapports':'rapports','agents':'agents','journal':'journal','parametres':'parametres'})){
 test(`${page}.html est une vraie page`,()=>{
   const html=fs.readFileSync(path.join(front,'src/pages',page+'.html'),'utf8');
   assert.match(html,new RegExp('data-page="'+id+'"'));
   assert.match(html,/src\/js\/main\.js/);
 });
}
