const mysql=require('mysql2/promise');
require('dotenv').config();
module.exports=mysql.createPool({
  host:process.env.DB_HOST||'127.0.0.1',
  port:Number(process.env.DB_PORT)||3306,
  user:process.env.DB_USER||'root',
  password:process.env.DB_PASSWORD||'',
  database:process.env.DB_NAME||'prefecta_ali_sabieh',
  waitForConnections:true,
  connectionLimit:10,
  dateStrings:true,
  timezone:'local',
  charset:'utf8mb4'
});
