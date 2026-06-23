const express = require("express");
const router = express.Router();
// 🌟 从 undici 同时导入 fetch 和 ProxyAgent，确保版本一致！
const { fetch, ProxyAgent } = require('undici');

const STEAM_KEY = process.env.STEAM_API_KEY;
const STEAM_ID = "76561198982241406";

// 从环境变量读取代理地址，没有设置就用直连
const PROXY_URL = process.env.HTTP_PROXY || process.env.HTTPS_PROXY || null;

router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const URL = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_KEY}&steamid=${STEAM_ID}&include_appinfo=true&include_played_free_games=1&format=json`;

        // 🌟 有代理就用代理，没有就直连
        const fetchOptions = {};
        if (PROXY_URL) {
            fetchOptions.dispatcher = new ProxyAgent(PROXY_URL);
        }

        const steamResponse = await fetch(URL, fetchOptions);

        if (!steamResponse.ok) {
            console.error("Steam API 返回错误状态:", steamResponse.status);
            return res.status(502).json({ error: `Steam API 返回 ${steamResponse.status}` });
        }

        const steamData = await steamResponse.json();
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
    catch(error) {
        console.error("Steam错误:", error.message);
        console.error("错误详情:", error.cause || error);
        res.status(500).json({ error: "获取游戏库失败", detail: error.message });
    }
});

module.exports = router;
// JSON
// {
//     "response": {
//         "game_count": 128,      // 🌟 你的游戏总数！
//         "games": [
//             {
//                 "appid": 730,                   // 游戏的唯一 ID
//                 "name": "Counter-Strike 2",     // 游戏名称
//                 "playtime_forever": 15600,      // 🌟 极其震撼的属性：总游玩时间！(单位是分钟，需要你自己除以 60 换算成小时)
//                 "img_icon_url": "834...68d",    // 图标的哈希值
//                 "has_community_visible_stats": true
//             },
//             {
//                 "appid": 1091500,
//                 "name": "Cyberpunk 2077",
//                 "playtime_forever": 4500,
//                 "img_icon_url": "b8a...12c"
//             }
//             // ... 你的其他 100 多个游戏
//         ]
//     }
// }