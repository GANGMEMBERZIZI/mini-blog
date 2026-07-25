import express from 'express';
const router=express.Router();
const UID='397877307';
const headers = {
     "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",

    "Referer":
    "https://www.bilibili.com/",

    "Accept":
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",

    "Accept-Language":
    "zh-CN,zh;q=0.9",
};
interface Bangumi {
    season_id: number;
    media_id: number;
    title: string;
    season_type_name?: string;
    all_tags?: string[];
    [key: string]: any; 
}
function htmlData(html:string){
    const start=html.indexOf('window.__INITIAL_STATE__');
    if(start===-1) return ;
        const braceStart=html.indexOf('{',start);
        let depth=0,i=braceStart;
        for(;i<html.length;i++){
        if(html[i]==='{')depth++;
        else if(html[i]==='}'&&--depth===0)break;
        } 
    try{
        return JSON.parse(html.substring(braceStart,i+1));
    }
    catch(error){
        return null;
    }
}
async function enhanceBangumiTages(bangumi:Bangumi){
    try{
        const detailURL =
        `https://api.bilibili.com/pgc/view/web/season?season_id=${bangumi.season_id}`;
        const detailResponse = await fetch(
            detailURL,
            {
                headers:headers
            }
        );
        const detailData = await detailResponse.json();
        if(detailData.code === 0){
            const styles =
                detailData.result?.styles ??
                detailData.result?.style ??
                [];
            const tags = styles
                .map((s:any)=>
                    typeof s === "string"
                    ? s
                    : s.name
                )
                .filter(Boolean);
            bangumi.all_tags =
                tags.length > 0
                ? tags
                : [bangumi.season_type_name || "番剧"];
            return bangumi;
        }
    }
    catch(error){
        console.log(error);
    }
    bangumi.all_tags=[
        bangumi.season_type_name || "番剧"
    ];
    return bangumi;
}
router.get("/",async(req,res)=>{
    try{
        const page=Number(req.query.page)||1;
        const limit=Number(req.query.limit)||20;
        const targetURL = `https://api.bilibili.com/x/space/bangumi/follow/list?vmid=${UID}&type=1&pn=${page}&ps=${limit}`;
        const bzhanResponse = await fetch(targetURL, { headers: headers });
        const bzhanData = await bzhanResponse.json();
        if (bzhanData.code !== 0) {
            return res.status(500).json({ error: "拒绝访问", detail: bzhanData.message });
        }
        const rawList=bzhanData.data.list;
        const totalCount = bzhanData.data.total;
        const calculatedTotalPages = Math.ceil(totalCount / limit);
        const enhancedList = await Promise.all(rawList.map(enhanceBangumiTages));
        res.json({
            code: 0,
            message: "0",
            data: {
                total: totalCount,
                page: calculatedTotalPages, 
                list: enhancedList 
            }
        });
    }
    catch(error){
        console.error("[Bangumi Router Error]:", error);
        res.status(500).json({ error: "服务器内部发生了可怕的错误，窃取失败！" });
    }
})
export default router;