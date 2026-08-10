import express from "express";
import multer from 'multer';
const router = express.Router();
import { OpenAI } from "openai";
import jwt from 'jsonwebtoken';
import { Pool } from "pg";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import path from "path";
export const pool = new Pool({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: process.env.DB_PASSWORD,
    database: 'postgres'
});
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 20 * 1024 * 1024,
        files: 9
    }
});
const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
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
            message: "身份认证已过期"
        });
    }
};
router.post("/", authenticateToken, upload.array('files', 9), async (req, res) => {
    try {
        let userMessage = req.body.message || "";
        const currentUserId = req.user?.id;
        const files = req.files;
        console.log(req.files);
        console.log(req.body);
        if (!currentUserId) {
            return res.status(401).json({ status: "error", message: "拒绝访问！" });
        }
        const filesUrl = [];
        let codeContext = "";
        if (files && files.length > 0) {
            await Promise.all(files.map(async (file) => {
                const ext = path.extname(file.originalname).toLowerCase();
                if (file.mimetype.startsWith('image/')) {
                    const cloudFileName = `ai/${Date.now()}-${file.originalname}`;
                    const uploadCommand = new PutObjectCommand({
                        Bucket: process.env.R2_BUCKET_NAME,
                        Key: cloudFileName,
                        Body: file.buffer,
                        ContentType: file.mimetype
                    });
                    await s3Client.send(uploadCommand);
                    filesUrl.push(`${process.env.R2_PUBLIC_DOMAIN}/${cloudFileName}`);
                }
                else if (['.js', '.ts', '.rs', '.c', '.cpp', '.txt', '.json', '.md', '.py', '.java', '.go', '.jsx', '.tsx', '.sql', '.yaml', '.yml', '.toml', '.xml', '.html', '.css', '.sh', '.hs'].includes(ext)) {
                    const fileString = file.buffer.toString('utf-8');
                    codeContext += `\n[FILE_CONTENT_START: ${file.originalname}]\n${fileString}\n[FILE_CONTENT_END]\n`;
                }
                else {
                    codeContext += `\n[用户上传了不支持解析的文件 ${file.originalname}]\n`;
                }
            }));
        }
        if (codeContext !== "") {
            userMessage = `用户上传了以下文件内容作为参考：\n${codeContext}\n\n用户的问题是：\n${userMessage}`;
        }
        console.log(codeContext);
        const query1 = `INSERT INTO AIhistory (user_id, role, content,attachments) VALUES ($1,'user',$2,$3)`;
        await pool.query(query1, [currentUserId, userMessage, filesUrl]);
        const historyQuery = `SELECT role, content,attachments FROM AIhistory WHERE user_id = $1 ORDER BY id ASC`;
        const historyResult = await pool.query(historyQuery, [currentUserId]);
        const apiMessage = [
            { role: "system", content: "你是姬野星奏" }
        ];
        for (let row of historyResult.rows) {
            const role = row.role === 'sena' ? 'assistant' : 'user';
            if (!row.attachments || row.attachments.length === 0) {
                apiMessage.push({
                    role,
                    content: row.content
                });
            }
            else {
                const multContent = [{ type: 'text', text: row.content }];
                for (let url of row.attachments) {
                    multContent.push({
                        type: 'image_url',
                        image_url: { url }
                    });
                }
                apiMessage.push({ role, content: multContent });
            }
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
        const historyQuery = `SELECT role, content,attachments FROM AIhistory WHERE user_id = $1 ORDER BY id ASC`;
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