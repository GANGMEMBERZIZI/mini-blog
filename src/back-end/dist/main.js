import path from 'path';
//import dotenv from 'dotenv';
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url); //ESM 里的url转换为绝对路径
const __dirname = path.dirname(__filename); //获得父级文件夹
// dotenv.config({
//     path:path.join(__dirname,'../../../.env')
// });
const port = process.env.PORT;
import express from 'express';
const app = express();
app.use(express.json());
import cookieParser from 'cookie-parser';
app.use(express.static(path.join(__dirname, '../../../public')));
import passageRouter from './passage.js';
import animeRouter from './anime.js';
import authRouter from './auth.js';
import commentRouter from './comment.js';
import chatRouter from './chat.js';
import gameRouter from './game.js';
app.get('/post', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../public/article.html'));
});
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../public/about.html'));
});
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../public/admin.html'));
});
app.get('/game', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../public/game.html'));
});
app.get('/anime', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../public/anime.html'));
});
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../public/login.html'));
});
app.get('/passage', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../public/passage.html'));
});
app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, '../../../public/chat.html'));
});
app.use(cookieParser());
app.use('/api/posts', passageRouter);
app.use('/api/auth', authRouter);
app.use('/api/about', commentRouter);
app.use('/api/about', passageRouter);
app.use('/api/chat', chatRouter);
app.use('/api/anime', animeRouter);
app.use('/api/game', gameRouter);
app.listen(port);
//# sourceMappingURL=main.js.map