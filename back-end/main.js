const path=require('path');
require('dotenv').config({
    path:path.join(__dirname,'../.env')
});
const port=process.env.PORT;
const express=require("express");
const app=express();
app.use(express.json());
let cookieParser = require('cookie-parser');
app.use(express.static(path.join(__dirname,'../public')));
const passageRouter=require("./passage.js");
const authRouter=require("./auth.js");
const commentRouter=require("./comments.js");
const chatRouter=require("./chat.js");
const animeRouter=require("./anime.js");
const gameRouter=require("./game.js");
app.get('/post',(req,res)=>{
    res.sendFile(path.join(__dirname,'../public/article.html'));
});
app.get('/about',(req,res)=>{
    res.sendFile(path.join(__dirname,'../public/about.html'));
});
app.get('/admin',(req,res)=>{
    res.sendFile(path.join(__dirname,'../public/admin.html'));
});
app.get('/anime',(req,res)=>{
    res.sendFile(path.join(__dirname,'../public/anime.html'));
});
app.use(cookieParser());
app.use('/api/posts',passageRouter);//传递整个函数指针
app.use('/api/auth',authRouter);
app.use('/api/about',commentRouter);
app.use('/api/chat',chatRouter);
app.use('/api/anime',animeRouter);
app.use('/api/game',gameRouter);
app.get('/anime',(req,res)=>{
    res.sendFile(path.join(__dirname,'../public/anime.html'));
});
app.get('/game',(req,res)=>{
    res.sendFile(path.join(__dirname,'../public/game.html'));
});
app.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname,'../public/login.html'));
});
app.get('/chat',(req,res)=>{
    res.sendFile(path.join(__dirname,"../public/chat.html"));

})
app.listen(port);