//passage back-end
import express from "express";
const router = express.Router();
import { pool } from './chat.js';
import removeMarkdown from "remove-markdown";
router.post('/', async (req, res) => {
    try {
        const { title, content, cover, password } = req.body;
        if (password != process.env.ADMIN_PASSWORD) {
            return res.status(403).json({ status: 'error', message: "密码错误" });
        }
        if (!title || !content || !cover) {
            return res.status(400).json({ status: "error", message: "标题和内容和封面不能为空！" });
        }
        const insertQuery = 'INSERT INTO passages (title,content,cover) VALUES ($1,$2,$3)';
        await pool.query(insertQuery, [title, content, cover]);
        res.json({ status: "success", message: `${title}成功` });
    }
    catch (error) {
        res.status(500).send(error);
    }
});
//展示页
router.get('/', async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 4;
        const offset = (page - 1) * limit;
        const dataQuery = 'SELECT title,LEFT(content,500) AS content,cover,created_at FROM passages ORDER BY created_at DESC LIMIT $1 OFFSET $2;';
        const result = await pool.query(dataQuery, [limit, offset]);
        const countQuery = 'SELECT COUNT(*) FROM passages';
        const countResult = await pool.query(countQuery);
        const totalPassages = Number(countResult.rows[0].count);
        const totalPages = Math.ceil(totalPassages / limit);
        const body = {
            currentPage: page,
            totalPages,
            totalPassages,
            data: result.rows.map(row => ({
                title: row.title,
                cover: row.cover,
                time: row.created_at,
                summary: removeMarkdown(row.content).replace(/\s+/g, " ").slice(0, 50)
            }))
        };
        res.json(body);
    }
    catch (error) {
        res.status(500).send("查询失败");
    }
});
//详情页
router.get('/:title', async (req, res) => {
    try {
        const query = 'SELECT title,content,cover,created_at FROM passages WHERE title=$1';
        const result = await pool.query(query, [req.params.title]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "文章不存在" });
        }
        const title = result.rows[0].title;
        const content = result.rows[0].content;
        const cover = result.rows[0].cover;
        const time = result.rows[0].created_at;
        res.json({ title: title, content: content, cover: cover, time: time });
    }
    catch (error) {
        res.status(500).json({ message: "查询失败" });
    }
});
router.delete("/:title", async (req, res) => {
    try {
        const { password } = req.body;
        if (password != process.env.ADMIN_PASSWORD) {
            return res.status(403).json({ status: 'error', message: "密码错误" });
        }
        const query = 'DELETE FROM passages WHERE title=$1';
        await pool.query(query, [req.params.title]);
        res.json({ status: "success", message: `《${req.params.title}》已删除` });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: "删除失败" });
    }
});
router.put('/:title', async (req, res) => {
    try {
        const { newTitle, content, cover, password } = req.body;
        if (password != process.env.ADMIN_PASSWORD) {
            return res.status(403).json({ status: 'error', message: "密码错误" });
        }
        const oldTitle = req.params.title;
        const targetTitle = newTitle ? newTitle : oldTitle;
        const query = 'UPDATE passages SET title = $1, content = $2,cover=$3 WHERE title = $4';
        await pool.query(query, [targetTitle, content, cover, oldTitle]);
        res.json({ status: "success", message: `数据重组完成` });
    }
    catch (error) {
        res.status(500).json({ status: 'error', message: "修改失败" });
    }
});
export default router;
//# sourceMappingURL=article.js.map