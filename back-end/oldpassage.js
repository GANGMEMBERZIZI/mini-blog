const express=require("express");
const fs = require('fs').promises;
const path=require('path'); 
const router=express.Router();
const dirPath=path.join(__dirname,'articles');
router.post('/', async (req,res)=>{
    try{
        const{title,content,password}=req.body;
        if(password!=process.env.ADMIN_PASSWORD){
            return res.status(403).json({status:'error',message:"密码错误"});
        }
        if(!title||!content)
            return res.status(400).json({ status: "error", message: "标题和内容不能为空！" });
        await fs.mkdir(dirPath,{ recursive: true });
        await fs.writeFile(path.join(dirPath,`${title}.txt`),content,'utf-8');
        res.json({status: "success", message: `${title}成功` });
    }
    catch(error){
        res.status(500).send(error);
    }
});
router.get('/',async (req,res)=>{
    try{
    await fs.mkdir(dirPath,{recursive: true});
    const files=await fs.readdir(dirPath);
    const titles=files.filter(f=>f.endsWith(".txt")).map(f=>f.replace('.txt',''));
    titles.reverse();
    //req.query在 HTTP 协议的物理法则中，网址里面问号 ? 后面的所有内容，都叫做“查询字符串”。
    //Express 框架极其贴心，它会自动把问号后面的键值对，炼化成一个极其干净的 JavaScript 对象，并把它挂载到 req.query 上。
    const page=parseInt(req.query.page)||1;
    const limit=parseInt(req.query.limit)||4;
    const startIndex=(page-1)*limit;
    const endIndex=page*limit;
    const showtitle=titles.slice(startIndex,endIndex);
    const totalPages=Math.ceil(titles.length/limit);
    res.json({
        currentPage:page,
        totalPages:totalPages,
        totalArticles:titles.length,
        data:showtitle
    });
  }
  catch(error){
    res.status(500).send("失败");
  }
});
router.get('/:title',async (req,res)=>{
    try{
        const articlePath=path.join(dirPath,`${req.params.title}.txt`);
        const content=await fs.readFile(articlePath,'utf-8');
        res.json({title: req.params.title, content});
    }
    catch(error){
        res.status(404).json({ message: "null" });
    }
});
router.delete("/:title",async (req,res)=>{
    try{
    const {password}=req.body;//前端发来的password
    if(password!=process.env.ADMIN_PASSWORD){
        return res.status(403).json({status:'error',message:"密码错误"});
    }
    const articlePath=path.join(dirPath,`${req.params.title}.txt`);
    await fs.unlink(articlePath);
    res.json({ status: "success", message: `《${req.params.title}》已删除` });
}catch(error){
    res.status(500).json({ status: 'error', message: "失败" });
}
});
router.put('/:title',async (req,res)=>{
    try{
        const {newTitle,content,password}=req.body;
        if(password!=process.env.ADMIN_PASSWORD){
            return res.status(403).json({status:'error',message:"密码错误"});
        }
        const oldTitle=req.params.title;
        const oldArticlePath=path.join(dirPath, `${oldTitle}.txt`);
        if(newTitle && newTitle !== oldTitle){
            const newArticlePath=path.join(dirPath,`${newTitle}.txt`);
            await fs.rename(oldArticlePath,newArticlePath);
            await fs.writeFile(newArticlePath,content,'utf-8');
        }else{
            await fs.writeFile(oldArticlePath, content, 'utf-8');
        }
        res.json({ status: "success", message: `完成` });
    }
    catch(error){
        res.status(500).json({ status: 'error', message: "失败" });
    }
});
module.exports = router;
