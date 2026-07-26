const container1 = document.querySelector(".text ul");
export const container = document.querySelector("#container");
export const prevBtn = document.querySelector(".prev-page");
export const nextBtn = document.querySelector(".next-page");
export const pageinfo = document.querySelector(".page-info");
;
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
let totalPage = 1;
async function loadPassages(page = 1) {
    try {
        const response = await fetch(`/api/passage?page=${page}&limit=4`);
        const result = await response.json();
        currentPage = result.currentPage;
        totalPage = result.totalPages;
        container1.innerHTML = '';
        const fragment = new DocumentFragment();
        result.data.forEach((article) => {
            const li = document.createElement('li');
            const cover = document.createElement('div');
            cover.className = 'articleCover';
            const img = document.createElement('img');
            img.src = article.cover;
            img.alt = article.title;
            img.loading = "lazy";
            cover.appendChild(img);
            const titlediv = document.createElement('div');
            titlediv.className = 'articleTitle';
            const titleH3 = document.createElement('h3');
            titleH3.innerText = article.title;
            titlediv.appendChild(titleH3);
            const contentDiv = document.createElement('div');
            contentDiv.className = 'articleContent';
            const content = document.createElement('p');
            content.innerText = article.summary;
            contentDiv.appendChild(content);
            const data = document.createElement('div');
            data.className = 'articleData';
            const time = document.createElement('span');
            time.innerText = article.time;
            data.appendChild(time);
            li.appendChild(cover);
            li.appendChild(titlediv);
            li.appendChild(contentDiv);
            li.appendChild(data);
            li.addEventListener('click', () => {
                window.location.href = `/passage/${encodeURIComponent(article.title)}`;
            });
            fragment.appendChild(li);
        });
        container1.appendChild(fragment);
        updatePaginationUI({ currentPage, totalPage, pageinfo, prevBtn, nextBtn });
    }
    catch (error) {
        console.log("读取失败，重试");
    }
}
async function passageInfo() {
}
prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        loadPassages(currentPage - 1);
    }
});
nextBtn.addEventListener("click", () => {
    if (currentPage < totalPage) {
        loadPassages(currentPage + 1);
    }
});
window.addEventListener("DOMContentLoaded", () => {
    loadPassages(1);
});
//# sourceMappingURL=passage.js.map