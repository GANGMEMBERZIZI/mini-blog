import express from 'express';
const router = express.Router();
import { fetch, ProxyAgent } from 'undici';
const STEAM_KEY = process.env.STEAM_API_KEY;
const STEAM_ID = "76561198982241406";
const PROXY_URL = process.env.HTTP_PROXY || process.env.HTTPS_PROXY || null;
router.get('/', async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const URL = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_KEY}&steamid=${STEAM_ID}&include_appinfo=true&include_played_free_games=1&format=json`;
        const fetchOptions = {};
        if (PROXY_URL) {
            fetchOptions.dispatcher = new ProxyAgent(PROXY_URL);
        }
        //console.log("我的Steam Key是：", process.env.STEAM_API_KEY);
        const steamResponse = await fetch(URL, fetchOptions);
        if (!steamResponse.ok) {
            console.error("Steam API 返回错误状态:", steamResponse.status);
            return res.status(502).json({ error: `Steam API 返回 ${steamResponse.status}` });
        }
        const steamData = (await steamResponse.json());
        const allGames = steamData.response.games || [];
        const totalCount = steamData.response.game_count;
        const calculatedTotalPages = Math.ceil(totalCount / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedGames = allGames.slice(startIndex, endIndex);
        res.json({
            code: 0,
            message: "0",
            data: {
                total: totalCount,
                page: calculatedTotalPages,
                list: paginatedGames
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: "获取游戏库失败", message: "steam错误" });
    }
});
export default router;
//# sourceMappingURL=game.js.map