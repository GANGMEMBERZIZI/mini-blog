import express from "express";
const router = express.Router();
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import { pool } from './chat.js';
import { authenticateToken } from './chat.js';
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ status: "error", message: "账号和密码绝对不能为空！" });
        }
        const checkUser = await pool.query('SELECT * FROM users WHERE username=$1', [username]);
        if (checkUser.rows.length > 0) {
            return res.status(409).json({ status: "error", message: "该用户已存在" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const query = 'INSERT INTO users (username,password_hash) VALUES ($1,$2)';
        await pool.query(query, [username, hashedPassword]);
        res.json({ status: "success", message: "注册成功！" });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "注册错误" });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ status: "error", message: "该用户不存在" });
        }
        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ status: "error", message: "密码错误" });
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({ status: "error", message: "JWT密钥未配置" });
        }
        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, secret, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: false,
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        res.json({
            status: "success",
            message: "登录成功，量子通行证已下发！",
            //token: token 
        });
    }
    catch (error) {
        res.status(500).json({ status: "error", message: "登录通道物理崩溃" });
    }
});
router.get('/me', authenticateToken, (req, res) => {
    res.json({ id: req.user?.id, username: req.user?.username, role: req.user?.role });
});
router.post('/logout', (req, res) => {
    res.clearCookie('token', { path: '/' }); //path 全部的网页
    res.json({ code: 0, message: "成功logout" });
});
export default router;
//# sourceMappingURL=auth.js.map