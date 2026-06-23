const fs=require("fs").promises;
const path=require("path");
const {Client}=require("pg");
async function startMigration(){
    //client 是类 Client是构造函数
const client=new Client({
    host:'localhost',
    port:5432,
    user: 'postgres',
    password: process.env.DB_PASSWORD, 
    database: 'postgres'
});
try{
    await client.connect();
    const folderPath=path.join(__dirname,'articles');
    const files=await fs.readdir(folderPath);
    for(const file of files){
        if(file.endsWith(".txt")){
           const title=file.replace('.txt','');
           const content=await fs.readFile(path.join(folderPath,file),'utf-8');
           const insertQuery = 'INSERT INTO posts (title, content) VALUES ($1, $2)';//$1 $2 占位符 纯文本不会执行
           await client.query(insertQuery, [title, content]);//读取node js里真实的参数
        }
    }
}
catch(error){
    console.error("出现错误", error);
}finally{
    await client.end();
}
}
startMigration();
