const express=require('express');
const router=express.Router();
const jwt=require('jsonwebtoken');
const {Pool}=require('pg');
const pool=new Pool({
    host:'localhost',
    port:5432,
    user: 'postgres',
    password: process.env.DB_PASSWORD, 
    database: 'postgres'
});
//中间件  架在“外网”和你的“数据库金库
const authenticateToken=(req,res,next)=>{
    // const authHeader=req.headers['authorization'];//在header对象里 找authorization 
    // const token = authHeader && authHeader.split(' ')[1];
    const token=req.cookies.token;
    if(!token)
        return res.status(401).json({ status: "error", message: "拒绝访问！" });
    jwt.verify(token,process.env.JWT_SECRET,(err,decodeUser)=>{//把jwt 前两个 跟secret 哈希处理 然后比对 第三个 是否一样
        if (err) return res.status(403).json({ status: "error", message: "通行证伪造或已过期" });
        req.user=decodeUser;//如果验证通过！验证机会把通行证里的明文（也就是我们在 auth.js 里塞进去的 { id: 1, username: 'zizi' }）解密出来，变成 decodedUser。
        next();//进行下面的操作
    });
};
//用户发布
router.post('/',authenticateToken,async (req,res)=>{
    try{
        const{content}=req.body;
        if(!content){
        return res.status(400).json({ status: "error", message: "不能为空" });
    }
    const userId=req.user.id;
    const query='INSERT INTO comments (user_id, content) VALUES ($1,$2)';
    await pool.query(query,[userId,content]);
    res.json({status: "success", message: `留言成功降临！` });
    }
    catch(error){
        res.status(500).json({ status: "error", message: "数据库写入异常" });
    }
});
//显示
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50; 
        const offset = (page - 1) * limit;
        const dataQuery = `
            SELECT comments.id, users.username AS nickname, comments.content, comments.created_at 
            FROM comments 
            INNER JOIN users ON comments.user_id = users.id 
            ORDER BY comments.id DESC 
            LIMIT $1 OFFSET $2
        `;
        const result = await pool.query(dataQuery, [limit, offset]);
        const countQuery = 'SELECT COUNT(*) FROM comments';
        const countResult = await pool.query(countQuery);
        const totalComments = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalComments / limit); 
        res.json({
            currentPage: page,
            totalPages: totalPages,
            totalComments: totalComments,
            data: result.rows 
        });
    } catch (error) {
        res.status(500).send("查询失败");
    }
});
//删除评论
router.delete("/:id",authenticateToken ,async (req, res) => { 
    try {
        const commentId = req.params.id;
        const currentUserId = req.user.id; 
        const checkQuery = 'SELECT user_id FROM comments WHERE id = $1';
        const checkResult = await pool.query(checkQuery, [commentId]);
        if (checkResult.rows.length === 0) {
            return res.status(404).json({ status: 'error', message: "该留言不存在" });
        }
        const authorId = checkResult.rows[0].user_id;
        const isAdmin =req.user.role === 'admin';
        if (authorId !== currentUserId && !isAdmin) {
            return res.status(403).json({ status: 'error', message: "你只能删除自己的留言！" });
        }
        const query = 'DELETE FROM comments WHERE id = $1';
        await pool.query(query, [commentId]);   
        res.json({ status: "success", message: `留言已删除` });
    } catch (error) {
        res.status(500).json({ status: 'error', message: "删除失败" });
    }
});
module.exports = router;