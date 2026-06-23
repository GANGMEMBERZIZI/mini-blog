import express from "express";
const router = express.Router();
import { OpenAI } from "openai";
import jwt from 'jsonwebtoken';
import { Pool } from "pg";
export const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'postgres'
});
let _openai = null;
function getOpenAI() {
    if (!_openai) {
        _openai = new OpenAI({
            baseURL: 'https://api.deepseek.com',
            apiKey: process.env.API_KEY,
        });
    }
    return _openai;
}
export const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ status: "error", message: "请先登录！" });
    }
    const secret = process.env.JWT_SECRET;
    if (!secret)
        return res.status(500).json({ status: "error", message: "服务器配置错误" });
    try {
        const decode = jwt.verify(token, secret);
        req.user = decode;
        next();
    }
    catch (error) {
        return res.status(403).json({
            status: "error",
            message: "通行证伪造或已过期"
        });
    }
};
router.post("/", authenticateToken, async (req, res) => {
    try {
        const userMessage = req.body.message;
        const currentUserId = req.user?.id;
        if (!currentUserId) {
            return res.status(401).json({ status: "error", message: "拒绝访问！" });
        }
        const query1 = `INSERT INTO AIhistory (user_id, role, content) VALUES ($1, 'user', $2)`;
        await pool.query(query1, [currentUserId, userMessage]);
        const historyQuery = `SELECT role, content FROM AIhistory WHERE user_id = $1 ORDER BY id ASC`;
        const historyResult = await pool.query(historyQuery, [currentUserId]);
        const apiMessage = [
            { role: "system", content: "你是姬野星奏" }
        ];
        for (let row of historyResult.rows) {
            apiMessage.push({
                role: row.role === 'sena' ? 'assistant' : 'user',
                content: row.content
            });
        }
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        const stream = await getOpenAI().chat.completions.create({
            messages: apiMessage,
            model: "deepseek-v4-pro",
            stream: true
        });
        let fullSenaMessage = "";
        for await (const chunk of stream) {
            const word = chunk.choices[0]?.delta?.content || "";
            res.write(word);
            fullSenaMessage += word;
        }
        const query2 = `INSERT INTO AIhistory (user_id, role, content) VALUES ($1, 'sena', $2)`;
        await pool.query(query2, [currentUserId, fullSenaMessage]);
        res.end();
    }
    catch (error) {
        console.error("星际召唤异常:", error);
        if (!res.headersSent) {
            res.status(500).json({ status: "error", message: "星际链路断裂" });
        }
        else {
            res.end();
        }
    }
});
router.get("/", authenticateToken, async (req, res) => {
    try {
        const currentUserId = req.user?.id;
        const historyQuery = `SELECT role, content FROM AIhistory WHERE user_id = $1 ORDER BY id ASC`;
        const result = await pool.query(historyQuery, [currentUserId]);
        res.json({
            data: result.rows
        });
    }
    catch (error) {
        res.status(500).send("查询失败");
    }
});
export default router;
//# sourceMappingURL=chat.js.map