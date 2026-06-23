const express=require("express");
const router=express.Router();
const {Pool}=require("pg");
const pool=new Pool({
    host:'localhost',
    port:5432,
    user: 'postgres',
    password: process.env.DB_PASSWORD, 
    database: 'postgres'
});
//增 post
router.post('/',async (req,res)=>{
    try{
    const{title,content,password}=req.body;
    if(password!=process.env.ADMIN_PASSWORD){
        return res.status(403).json({status:'error',message:"密码错误"});
    }
    if(!title||!content){
        return res.status(400).json({ status: "error", message: "标题和内容不能为空！" });
    }
    const insertQuery='INSERT INTO posts (title,content) VALUES ($1,$2)';
    await pool.query(insertQuery, [title, content]);
//     Node.js 把字符串和数组打包。
// 通过 TCP/IP 协议栈，顺着网线（哪怕是 localhost）发送给 5432 端口。
// PostgreSQL 引擎收到数据，进行解析。
// PostgreSQL 驱动物理硬盘的磁头，把数据真正刻录进磁盘的扇区。
// 数据库返回一个“写入成功”的信号给 Node.js。
   res.json({status: "success", message: `${title}成功` });
}
catch(error){
    res.status(500).send(error);
}
});
router.get('/',async (req,res)=>{
    try{
        const page=parseInt(req.query.page)||1;
        const limit=parseInt(req.query.limit)||4;
        const offset=(page-1)*limit;//每次有一个浏览器向你的服务器发起 GET / 请求，Express 引擎就会在一毫秒内，为你凭空劈开一个极其纯净的、全新的“平行宇宙（执行上下文 Execution Context）”。 所以是const
        const dataQuery='SELECT title FROM posts ORDER BY id DESC LIMIT $1 OFFSET $2';
        const result=await pool.query(dataQuery,[limit,offset]);
        // result 的真实物理结构
// {
//   command: 'SELECT',
//   rowCount: 4,      // 告诉你这次切片抓到了 4 行
//   oid: null,
//   rows: [           // 🌟 极其关键！真实的物质存放于 rows 这个数组里！
//     { title: '用vibe coding的品味' },
//     { title: '打老婆是一种艺术！' },
//     { title: '有感而发！' },
//     { title: '第一篇日记' }
//   ],
//   fields: [ ... ]   // 这里面装着底层物理字段的元数据（可以无视）
// }
   const countQuery = 'SELECT COUNT(*) FROM posts';//计算数量
   const countResult=await pool.query(countQuery);//返回对象
   const totalArticles = parseInt(countResult.rows[0].count);
   const totalPages = Math.ceil(totalArticles / limit);//计算页数
   res.json({
        currentPage:page,
        totalPages:totalPages,
        totalArticles:totalArticles,
        data:result.rows.map(row => row.title)
    });
    }
    catch(error){
        res.status(500).send("查询失败");
    }
});
router.get('/:title',async (req,res)=>{
    try{
        const query='SELECT title,content FROM posts WHERE title= $1';
        const result=await pool.query(query,[req.params.title]);
        if(result.rows.length===0){
            return res.status(404).json({ message: "null" });
        }
        res.json(result.rows[0]);//返回查到的文章
    }
    catch(error){
        res.status(500).json({ message: "查询失败" });
    }
});
router.delete("/:title",async (req,res)=>{
    try{
        const { password } = req.body;
        if (password != process.env.ADMIN_PASSWORD) {
            return res.status(403).json({ status: 'error', message: "密码错误" });
        }
        const query='DELETE FROM posts WHERE title=$1';
        await pool.query(query,[req.params.title]);
        res.json({ status: "success", message: `《${req.params.title}》已删除` });
    }
    catch(error){
        res.status(500).json({ status: 'error', message: "删除失败" });
    }
});
router.put('/:title',async (req,res)=>{
    try{
        const {newTitle,content,password}=req.body;
        if(password!=process.env.ADMIN_PASSWORD){
            return res.status(403).json({status:'error',message:"密码错误"});
        }
        const oldTitle = req.params.title;
        const targetTitle = newTitle ? newTitle : oldTitle;
        const query = 'UPDATE posts SET title = $1, content = $2 WHERE title = $3';
        await pool.query(query, [targetTitle, content, oldTitle]);
        res.json({ status: "success", message: `数据重组完成` });
    }
    catch(error){
        res.status(500).json({ status: 'error', message: "修改失败" });
    }
});
module.exports = router;


