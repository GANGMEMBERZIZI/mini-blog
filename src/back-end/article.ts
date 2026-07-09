import express from "express";
const router=express.Router();
import {marked} from 'marked';
import {pool} from './chat.js';
import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { Pool } from "pg";
interface data{
    currentPage:number,
    totalPages:number,
    totalPassages:number,
    data:string[];
}
const window=new JSDOM("").window;
const DOMPurify = createDOMPurify(window as any);

router.post('/',async(req,res)=>{
    try{
        const{title,content,password}=req.body;
        if(password!=process.env.ADMIN_PASSWORD){
             return res.status(403).json({status:'error',message:"密码错误"});
        }
        if(!title||!content){
            return res.status(400).json({ status: "error", message: "标题和内容不能为空！" });
        }
        const insertQuery='INSERT INTO passages (title,content) VALUES ($1,$2)';
        await pool.query(insertQuery,[title,content]);
        res.json({status: "success", message: `${title}成功` });
    }
    catch(error){
        res.status(500).send(error);
    }
});
router.get('/',async(req,res)=>{
    try{
        const page=Number(req.query.page)||1;
        const limit=Number(req.query.limit)||4;
        const offset=(page-1)*limit;
        const dataQuery='SELECT title FROM passages ORDER BY created_at DESC LIMIT $1 OFFSET $2;';
        const result=await pool.query(dataQuery,[limit,offset]);
        const countQuery='SELECT COUNT(*) FROM passages';
        const countResult=await pool.query(countQuery);
        const totalPassages=Number(countResult.rows[0].count);
        const totalPages=Math.ceil(totalPassages/limit);
        const body:data={
            currentPage:page,
            totalPages:totalPages,
            totalPassages:totalPassages,
            data:result.rows.map(row=>row.title)
        };
        res.json(body); 
    }
    catch(error){
        res.status(500).send("查询失败");
    }
});
router.get('/:title',async(req,res)=>{
    try{
        const query='SELECT title,content FROM passages WHERE title=$1';
        const result=await pool.query(query,[req.params.title]);
        if(result.rows.length===0){
            return res.status(404).json({ message: "文章不存在" });
        }
        const title=result.rows[0].title;
        const html=DOMPurify.sanitize(await marked.parse(result.rows[0].content));
        res.json({title:title,content:html});
    }
    catch(error){
        res.status(500).json({ message: "查询失败" });
    }
});
router.delete("/:title",async(req,res)=>{
    try{
        const{password}=req.body;
        if(password != process.env.ADMIN_PASSWORD){
            return res.status(403).json({ status: 'error', message: "密码错误" });
        }
        const query='DELETE FROM passages WHERE title=$1';
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
        const query = 'UPDATE passages SET title = $1, content = $2 WHERE title = $3';
        await pool.query(query, [targetTitle, content, oldTitle]);
        res.json({ status: "success", message: `数据重组完成` });
    }
    catch(error){
        res.status(500).json({ status: 'error', message: "修改失败" });
    }
});
export default router;