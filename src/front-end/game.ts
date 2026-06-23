export const container=document.querySelector<HTMLDivElement>("#container");
export const prevBtn=document.querySelector<HTMLButtonElement>(".prev-page");
export const nextBtn=document.querySelector<HTMLButtonElement>(".next-page");
export const pageinfo=document.querySelector<HTMLSpanElement>(".page-info");
if(!container||!prevBtn||!nextBtn||!pageinfo)
    throw new Error("空的");
interface steamGame{
    appid: number;
    name: string;
    playtime_forever: number;
    img_icon_url: string;
}
let currentPage=1;
async function loadGameList(page:number=1){
    try{
        const response=await fetch(`/api/game?page=${page}&limit=10`);
        const gameData=await response.json();
        if (gameData.code !== 0) {
            console.error("Steam API 返回错误:", gameData.message);
            return;
        }
        const steamGames:steamGame[] = gameData.data.list;
        const totalPage=gameData.data.page;
        container!.innerHTML = "";
        steamGames.forEach(game => {
        const hoursPlayed = (game.playtime_forever / 60).toFixed(1);
        const card = document.createElement("div");
        card.className = "bangumi-card"; 
        card.onclick = () => {
            const targetLink = `https://store.steampowered.com/app/${game.appid}/`;
            window.open(targetLink, '_blank');
        };
        let statusTag = Number(hoursPlayed) > 0 ? '已游玩' : '吃灰中'; 
        const tagsToRender = ['Steam', statusTag]; 
        const tagsHTML = tagsToRender.map(tagWord => `<span class="tag">${tagWord}</span>`).join('');
        const fullImageUrl = `http://media.steampowered.com/steamcommunity/public/images/apps/${game.appid}/${game.img_icon_url}.jpg`;
        card.innerHTML = `
            <img class="bangumi-cover" src="${fullImageUrl}" referrerpolicy="no-referrer" alt="${game.name}">
            <div class="bangumi-info">
                <div class="bangumi-title">${game.name}</div>
                
                <div class="bangumi-tags">
                    ${tagsHTML}
                </div>
                
                <div class="bangumi-desc">zizi 在 Steam 游玩此游戏，累计挥霍了 ${hoursPlayed} 小时的时间...</div>
                
                <div class="bangumi-meta">已游玩 ${hoursPlayed} 小时</div>
            </div>
        `;
        container!.appendChild(card);
    });
    updatePaginationUI({currentPage,totalPage,pageinfo,prevBtn,nextBtn});
    }catch(error){
        console.error("出现错误:", error);
    }
}
export function updatePaginationUI(params: {
  currentPage: number;
  totalPage: number;
  pageinfo: HTMLSpanElement | null;
  prevBtn: HTMLButtonElement | null;
  nextBtn: HTMLButtonElement | null;}) {
    const { currentPage, totalPage, pageinfo, prevBtn, nextBtn } = params;
    if (pageinfo) {
    pageinfo.innerText = `第 ${currentPage} 页 / 共 ${totalPage} 页`;
  }

  if (prevBtn) {
    const disabled = currentPage <= 1;
    prevBtn.disabled = disabled;
    prevBtn.style.opacity = disabled ? "0.8" : "1";
  }

  if (nextBtn) {
    const disabled = currentPage >= totalPage;
    nextBtn.disabled = disabled;
    nextBtn.style.opacity = disabled ? "0.8" : "1";
  }
}
prevBtn!.onclick = function(){
    if (currentPage > 1) {
        currentPage--;
        loadGameList(currentPage); 
    }
};

nextBtn!.onclick = function(){
    if (!nextBtn!.disabled) {
        currentPage++;
        loadGameList(currentPage);
    }
};
window.addEventListener('DOMContentLoaded', () => {
    loadGameList(1);
});
