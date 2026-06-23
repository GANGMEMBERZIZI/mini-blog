const submitBtn = document.querySelector("#submit-btn");
const listBox = document.querySelector("#list-box");
const viewerTitle = document.querySelector("#viewer-title");
const viewerContent = document.querySelector("#viewer-content");
const viewerActions = document.querySelector("#viewer-actions");
const updateBtn = document.querySelector("#update-btn");
const deleteBtn = document.querySelector("#delete-btn");
if (!submitBtn || !listBox || !viewerTitle || !viewerContent || !viewerActions || !updateBtn || !deleteBtn) {
    throw new Error("出现为null的错误");
}
let currentEditingTitle = "";
;
async function loadArticleList() {
    try {
        const response = await fetch("/api/posts?page=1&limit=100");
        const result = await response.json();
        const titles = result.data;
        if (titles.length === 0) {
            listBox.innerHTML = "<p style='color:gray;'>藏经阁空空如也，速速挥毫泼墨！</p>";
            return;
        }
        listBox.innerHTML = titles.map(t => `<div class="article-link" data-title="${t}">📄 ${t}</div>`).join("");
    }
    catch (error) {
        listBox.innerHTML = "加载列表失败: " + error;
    }
}
listBox.addEventListener("click", (event) => {
    const target = event.target;
    const title = target.getAttribute("data-title");
    if (title) {
        readArticle(title);
    }
});
async function readArticle(title) {
    try {
        viewerTitle.value = title;
        viewerContent.value = "正在从硬盘磁道提取字节流...";
        const response = await fetch(`/api/posts/${encodeURIComponent(title)}`); //URL 安全编码
        const data = await response.json();
        viewerTitle.value = data.title;
        viewerContent.value = data.content;
        currentEditingTitle = data.title;
        viewerActions.style.display = "flex";
    }
    catch (error) {
        viewerContent.innerText = "读取失败: " + error;
    }
}
submitBtn.onclick = async function () {
    const titleValue = document.querySelector("#title")?.value;
    const contentValue = document.querySelector("#content")?.value;
    const pwdValue = document.querySelector("#admin-pwd")?.value;
    if (!titleValue || !contentValue)
        return alert("标题和内容不能为空！");
    try {
        const response = await fetch('/api/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: titleValue, content: contentValue, password: pwdValue })
        });
        const data = await response.json();
        if (data.status === "success") {
            document.querySelector("#title").value = "";
            document.querySelector("#content").value = "";
            await loadArticleList();
        }
    }
    catch (error) {
        alert("通讯中断：" + error);
    }
};
updateBtn.onclick = async function () {
    const pwdValue = document.querySelector("#admin-pwd")?.value;
    const newTitleValue = viewerTitle.value;
    const newContentValue = viewerContent.value;
    if (!newTitleValue && !newContentValue)
        return alert("标题或内容不能为空！");
    try {
        const response = await fetch(`/api/posts/${encodeURIComponent(currentEditingTitle)}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...(newTitleValue && { newTitle: newTitleValue }), ...(newContentValue && { content: newContentValue }), password: pwdValue })
        });
        //如果写了newtitle ...会解开对象 装进大对象里
        const data = await response.json();
        if (data.status === "success") {
            if (newTitleValue) {
                currentEditingTitle = newTitleValue;
            }
            document.querySelector("#viewer-title").value = "";
            await loadArticleList();
        }
    }
    catch (error) {
        alert("通讯中断：" + error);
    }
};
deleteBtn.onclick = async function () {
    const pwdValue = document.querySelector("#admin-pwd").value;
    try {
        const response = await fetch(`/api/posts/${encodeURIComponent(currentEditingTitle)}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pwdValue })
        });
        const data = await response.json();
        if (data.status === "success") {
            viewerTitle.value = "";
            viewerContent.value = "";
            viewerActions.style.display = "none";
            currentEditingTitle = "";
            await loadArticleList();
        }
    }
    catch (error) {
        alert("通讯中断：" + error);
    }
};
window.addEventListener("DOMContentLoaded", () => {
    loadArticleList();
});
export {};
//# sourceMappingURL=admin.js.map