const express=require("express");
const router=express.Router();
const {OpenAI}=require("openai");
const jwt = require('jsonwebtoken');
const {Pool}=require("pg");
const pool=new Pool({
    host:'localhost',
    port:5432,
    user: 'postgres',
    password: process.env.DB_PASSWORD, 
    database: 'postgres'
});
const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: process.env.API_KEY,
});
//Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...（后面跟着极其长的一串字母）
const authenticateToken=(req,res,next)=>{
    // const authHeader=req.headers['authorization'];//在header对象里 找authorization 
    // const token = authHeader && authHeader.split(' ')[1];//如果没传token token就是 本身的undefined [Bearner,eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9]
    const token=req.cookies.token;
    if(!token)
        return res.status(401).json({ status: "error", message: "拒绝访问！" });
    jwt.verify(token,process.env.JWT_SECRET,(err,decodeUser)=>{//把jwt 前两个 跟secret 哈希处理 然后比对 第三个 是否一样
        if (err) return res.status(403).json({ status: "error", message: "通行证伪造或已过期" });
        req.user=decodeUser;//如果验证通过！验证机会把通行证里的明文（也就是我们在 auth.js 里塞进去的 { id: 1, username: 'zizi' }）解密出来，变成 decodedUser。
        next();//进行下面的操作
    });
};
router.post("/",authenticateToken,async (req,res)=>{
    try{
        const userMessage=req.body.message;
        const currentUserId = req.user.id;
        const query1 = `INSERT INTO AIhistory (user_id, role, content) VALUES ($1, 'user', $2)`;
        await pool.query(query1, [currentUserId, userMessage]);
        const historyQuery = `SELECT role, content FROM AIhistory WHERE user_id = $1 ORDER BY id ASC`;
        const historyResult = await pool.query(historyQuery, [currentUserId]);
        const apiMessage=[{role:"system",content:"你是姬野星奏"}];
        for(let row of historyResult.rows){
            apiMessage.push({
                role: row.role === 'sena' ? 'assistant' : 'user',
                content: row.content
            });
        }
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control','no-cache');
        res.setHeader('Connection','keep-alive');
        const stream = await openai.chat.completions.create({
    messages: apiMessage,
    model: "deepseek-v4-pro",
    stream:true
  });
  //stream 迭代器
//   {
//   "id": "chatcmpl-912345678",
//   "object": "chat.completion.chunk", 
//   "created": 1717400000,
//   "model": "deepseek-v4-pro",
//   "choices": [
//     {
//       "index": 0,
//       "delta": {
//         "content": "好"
//       },
//       "finish_reason": null
//     }
//   ]
// }
let fullSenaMessage="";
  for await (const chunk of stream){//代替了 stream.on("end") 和res.end
    const word = chunk.choices[0]?.delta?.content || "";
    res.write(word);
    fullSenaMessage+=word;
  }
  const query2 = `INSERT INTO AIhistory (user_id, role, content) VALUES ($1, 'sena', $2)`;
  await pool.query(query2, [currentUserId, fullSenaMessage]);
  res.end();
    }catch(error){
        console.error("星际召唤异常:", error);
       if (!res.headersSent) {
            res.status(500).json({ status: "error", message: "星际链路断裂" });
        } else {
            res.end();
        }
    }
});
router.get("/",authenticateToken,async (req,res)=>{
    try{
        const currentUserId = req.user.id;
        const historyQuery = `SELECT role, content FROM AIhistory WHERE user_id = $1 ORDER BY id ASC`;
        const result = await pool.query(historyQuery, [currentUserId]);
        res.json({
            data: result.rows
        });
    }
    catch(error){
        res.status(500).send("查询失败");
    }
});
module.exports = router;
