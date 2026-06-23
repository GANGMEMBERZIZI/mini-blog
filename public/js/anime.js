export const container = document.querySelector("#container");
export const prevBtn = document.querySelector(".prev-page");
export const nextBtn = document.querySelector(".next-page");
export const pageinfo = document.querySelector(".page-info");
export function updatePaginationUI(params) {
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
let currentPage = 1;
async function loadAnimeList(page = 1) {
    try {
        const response = await fetch(`/api/anime?page=${page}&limit=20`);
        const animeData = await response.json();
        if (animeData.code !== 0) {
            console.error("B站拒绝访问:", animeData.message);
            return;
        }
        const allBangumi = animeData.data.list;
        const totalPage = animeData.data.page;
        container.innerHTML = "";
        allBangumi.forEach(bangumi => {
            const card = document.createElement("div");
            card.className = "bangumi-card";
            card.onclick = () => {
                const targetLink = `https://www.bilibili.com/bangumi/media/md${bangumi.media_id}`;
                window.open(targetLink, '_blank');
            };
            const tagsToRender = bangumi.all_tags.length ? bangumi.all_tags : [bangumi.season_type_name || '番剧'];
            const tagsHTML = tagsToRender.map(tagWord => `<span class="tag">${tagWord}</span>`).join("");
            card.innerHTML = `
        <img class="bangumi-cover" src="${bangumi.cover}" referrerpolicy="no-referrer" alt="${bangumi.title}">
        <div class="bangumi-info">
            <div class="bangumi-title">${bangumi.title}</div>
            
            <div class="bangumi-tags">
                ${tagsHTML}
            </div>
            
            <div class="bangumi-desc">${bangumi.evaluate || '这部番剧极其神秘，暂无简介...'}</div>
            
            <div class="bangumi-meta">${bangumi.new_ep?.index_show || '进度未知'}</div>
        </div>
    `;
            container.appendChild(card);
        });
        updatePaginationUI({ currentPage, totalPage, pageinfo, prevBtn, nextBtn });
    }
    catch (error) {
        console.error("出现错误:", error);
    }
}
prevBtn.onclick = function () {
    if (currentPage > 1) {
        currentPage--;
        loadAnimeList(currentPage);
    }
};
nextBtn.onclick = function () {
    if (!nextBtn.disabled) {
        currentPage++;
        loadAnimeList(currentPage);
    }
};
window.addEventListener('DOMContentLoaded', () => {
    loadAnimeList(1);
});
//# sourceMappingURL=anime.js.map