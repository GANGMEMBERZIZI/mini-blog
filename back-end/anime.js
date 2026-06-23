const express=require("express");
const router=express.Router();
const UID="397877307";
router.get("/",async (req,res)=>{
    try{
        const page = parseInt(req.query.page) || 1;//前端的查询字符串
        const limit = parseInt(req.query.limit) || 20;
        const targetURL = `https://api.bilibili.com/x/space/bangumi/follow/list?vmid=${UID}&type=1&pn=${page}&ps=${limit}`;
        const bzhanResponse = await fetch(targetURL, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
        });
        const bzhanData = await bzhanResponse.json();
        if (bzhanData.code !== 0) {
            return res.status(500).json({ error: "拒绝访问", detail: bzhanData.message });
        }
        const rawList=bzhanData.data.list;
        const totalCount = bzhanData.data.total;
        const calculatedTotalPages = Math.ceil(totalCount / limit);
        // 提取标签的完整流程（PGC主线 → 页面爬取兜底）
        async function fetchTags(bangumi){
            let tags=null;
            // 主线：PGC详情接口
            try{
                const detailURL=`https://api.bilibili.com/pgc/view/web/season?season_id=${bangumi.season_id}`;
                const detailResponse=await fetch(detailURL,{
                    headers:{
                        "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                        "Referer":"https://www.bilibili.com/",
                        "Origin":"https://www.bilibili.com"
                    }
                });
                const detailData=await detailResponse.json();
                if(detailData.code===0){
                    const rawStyles=detailData.result.style||[];
                    const styles=Array.isArray(rawStyles)
                        ?rawStyles.map(s=>typeof s==='string'?s:(s?.name||String(s))).filter(Boolean)
                        :[];
                    if(styles.length>0) tags=styles;
                }
            }catch(e){}
            // 兜底：爬番剧页面HTML
            if(!tags){
                try{
                    const pageResp=await fetch(`https://www.bilibili.com/bangumi/media/md${bangumi.media_id}`,{
                        headers:{
                            "User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                            "Referer":"https://www.bilibili.com/"
                        }
                    });
                    const html=await pageResp.text();
                    const start=html.indexOf('window.__INITIAL_STATE__');
                    if(start!==-1){
                        const braceStart=html.indexOf('{',start);
                        let depth=0,i=braceStart;
                        for(;i<html.length;i++){
                            if(html[i]==='{')depth++;
                            else if(html[i]==='}'&&--depth===0)break;
                        }
                        const state=JSON.parse(html.substring(braceStart,i+1));
                        const info=state.mediaInfo||state.initMedia||{};
                        const fetchedStyles=info.styles||info.style||info.styles_list||info.tags||[];
                        const extracted=Array.isArray(fetchedStyles)
                            ?fetchedStyles.map(s=>typeof s==='string'?s:(s?.name||String(s))).filter(Boolean)
                            :(typeof fetchedStyles==='string'?fetchedStyles.split(/[\/,，]/).map(s=>s.trim()).filter(Boolean):[]);
                        if(extracted.length>0) tags=extracted;
                    }
                }catch(e2){}
            }
            bangumi.all_tags=tags||[bangumi.season_type_name||'番剧'];
            return bangumi;
        }
        // 所有番剧并发获取标签
        const enhanceList=await Promise.all(rawList.map(b=>fetchTags(b)));
        res.json({
            code: 0,
            message: "0",
            data: {
                total: totalCount,
                page: calculatedTotalPages, 
                list: enhanceList 
            }
        });
    }
catch(error){
    res.status(500).json({ error: "窃取失败" });
}
});
module.exports = router;
// {
//     "code": 0,             // 🌟 核心状态码：0 代表绝对的成功！如果是负数（如 -400），说明请求被拒绝或参数错误。
//     "message": "0",        // 状态信息，通常成功时是 "0"
//     "ttl": 1,              // 存活时间（不用管）
//     "data": {              // 🌟 第二层装甲：真正的数据载体
//         "pn": 1,           // 当前页码 (Page Number)
//         "ps": 15,          // 每页多少条 (Page Size)
//         "total": 42,       // 你的追番总数！(可以拿来在网页上炫耀)
//         "list": [          // 🌟 第三层核心：这才是你真正需要的“番剧数组”！
//             {
//                 "season_id": 44026,          // 番剧的唯一 ID
//                 "title": "某科学的超电磁炮T",  // 📺 番剧名称
//                 "cover": "http://i0.hdslb.com/bfs/bangumi/...", // 🖼️ 极其重要的海报封面图链接！
//                 "evaluate": "总人口达230万人的东京都西部...",   // 📖 番剧简介
//                 "season_type_name": "番剧",  // 类型
//                 "new_ep": {                  // 进度信息对象
//                     "id": 123456,
//                     "index_show": "全25话",  // 🌟 更新状态（比如“更新至第12话”或“全24话”）
//                     "title": "25"
//                 },
//                 "stat": {
//                     "view": 12345678,        // 播放量
//                     "danmaku": 54321,        // 弹幕数
//                     "follow": 8765432        // 追番人数
//                 }
//             },
//             // ... 下面是第二部、第三部番剧的对象 ...
//         ]
//     }
// }


//detail
// {
//     "code": 0,                // 🌟 绝对状态码：0 代表突刺成功！
//     "message": "success",
//     "result": {               // 🌟 终极宝箱：所有的详情数据都在这个 result 里！(注意：列表接口是 data，这里是 result)
//         "season_id": 44026,
//         "title": "某科学的超电磁炮T",
//         "type": 1,            // 1代表番剧
//         "cover": "http://...",// 高清海报
//         "evaluate": "总人口达230万人的...", // 极其完整的长篇简介
        
//         // 🎯 你的终极战利品：风格标签阵列！
//         "style": [
//             "搞笑",
//             "热血",
//             "战斗",
//             "漫画改"
//         ], 

//         "rating": {           // 🌟 评分结界
//             "count": 145678,  // 多少人评分
//             "score": 9.8      // 极其耀眼的 B 站评分！(你可以把它也加到你的卡片上！)
//         },

//         "stat": {             // 🌟 物理统计数据
//             "coins": 876543,  // 投币数
//             "danmakus": 12345,// 弹幕总数
//             "views": 98765432 // 总播放量
//         },

//         "up_info": {          // 🌟 官方账号信息
//             "mid": 928123,
//             "uname": "哔哩哔哩番剧",
//             "avatar": "http://..."
//         },

//         "episodes": [         // 🌟 极其庞大的分集阵列！里面包含了每一集的详细信息
//             {
//                 "id": 28224081,
//                 "title": "1",               // 第1话
//                 "long_title": "超电磁炮",     // 这一话的副标题
//                 "cover": "http://...",      // 这一集自己的封面截图
//                 "share_url": "https://..."  // 这一集的直接播放链接
//             },
//             // ... 第2话, 第3话 ...
//         ]
        
//         // ... 还有诸如声优列表(actors)、相关推荐(seasons)等无数深层数据 ...
//     }
// }