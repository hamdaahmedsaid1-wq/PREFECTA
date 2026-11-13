import {defineConfig} from 'vite';
import {resolve} from 'node:path';
import {readdirSync} from 'node:fs';
const pages=Object.fromEntries(readdirSync(resolve('src/pages')).filter(name=>name.endsWith('.html')).map(name=>[name.slice(0,-5),resolve('src/pages',name)]));
export default defineConfig({
  server:{host:'127.0.0.1',port:5173,strictPort:true,proxy:{'/api':{target:'http://127.0.0.1:3000',changeOrigin:true}}},
  build:{outDir:'dist',rollupOptions:{input:{index:resolve('index.html'),...pages}}}
});
