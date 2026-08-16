import express from "express";
const router=express.Router();
import { Request, Response, NextFunction } from 'express';
import jwt,{ JwtPayload } from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import {pool} from './main.js';
export const authenticateToken=(req:Request,res:Response,next:NextFunction)=>{
    const token=req.cookies.token;
    if(!token){
        return res.status(401).json({ status: "error", message: "请先登录！" });
    }
    const secret = process.env.JWT_SECRET;
    if(!secret)
        return res.status(500).json({ status: "error", message: "服务器配置错误" });
    try{
        const decode=jwt.verify(token,secret) as JwtPayload;
        req.user = decode; 
        next();
    }
    catch(error){
         return res.status(403).json({
        status: "error",
        message: "身份认证已过期"
    });
    }
};
router.post('/register',async(req,res)=>{
    try{
        const {username,password}=req.body;
        if(!username||!password){
            return res.status(400).json({ status: "error", message: "账号和密码绝对不能为空！" });
        }
        const checkUser=await pool.query('SELECT * FROM users WHERE username=$1',[username]);
        if(checkUser.rows.length>0){
            return res.status(409).json({ status: "error", message: "该用户已存在" });
        }
        const hashedPassword=await bcrypt.hash(password,10);
        const query='INSERT INTO users (username,password_hash) VALUES ($1,$2)';
        await pool.query(query,[username,hashedPassword]);
        res.json({ status: "success", message: "注册成功！" });
    }
    catch(error){
        res.status(500).json({ status: "error", message: "注册错误" });
    }
});
router.post('/login',async(req,res)=>{
    try{
    const{username,password}=req.body;
    if(!username||!password){
            return res.status(400).json({ status: "error", message: "账号和密码绝对不能为空！" });
    }
    const result=await pool.query('SELECT * FROM users WHERE username = $1',[username]);
    if(result.rows.length===0){
        return res.status(401).json({status:"error",message:"该用户不存在"});
    }
    const user=result.rows[0];
    const isMatch=await bcrypt.compare(password,user.password_hash);
    if(!isMatch){
        return res.status(401).json({ status: "error", message: "密码错误" });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return res.status(500).json({ status: "error", message: "JWT密钥未配置" });
    }
    const token=jwt.sign({id:user.id,username:user.username,role:user.role},
            secret,
            {expiresIn:'7d'}
        );
    res.cookie('token',token,{
        httpOnly:true,
        secure:false,
        sameSite:'lax',
        maxAge:7*24*60*60*1000
    });
    res.json({ 
        status: "success", 
        message: "登录成功，量子通行证已下发！",
    });
}
catch(error){
     res.status(500).json({ status: "error", message: "登录错误" });
}
});
router.put('/change',async(req,res)=>{
    try{
        const {username,oldpassword,newpassword}=req.body;
        if(!username||!newpassword||!oldpassword){
            return res.status(400).json({ status: "error", message: "账号和密码绝对不能为空！" });
        }
        const result=await pool.query('SELECT * FROM users WHERE username = $1',[username]);
        if(result.rows.length===0){
            return res.status(401).json({status:"error",message:"该用户不存在"});
        }
        const isMatch=await bcrypt.compare(oldpassword,result.rows[0].password_hash);
        if(!isMatch){ 
        return res.status(401).json({ status: "error", message: "旧密码错误了" });
        }
        const hashedPassword=await bcrypt.hash(newpassword,10);
        const query='UPDATE users SET password_hash=$1 WHERE username=$2';
        await pool.query(query,[hashedPassword,username]);
        res.json({ status: "success", message: "修改成功" });
    }
    catch(error){
        res.status(500).json({ status: "error", message: "修改错误" });
    }
});
router.get('/me',authenticateToken,(req,res)=>{
    res.json({id: req.user?.id,username:req.user?.username,role:req.user?.role });
});
router.post('/logout',(req,res)=>{
    res.clearCookie('token',{path:'/'});//path 全部的网页
    res.json({code:0,message:"成功logout"});
});
export default router;