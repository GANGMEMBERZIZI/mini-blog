const titleInput = document.querySelector("#title");
const coverInput = document.querySelector("#cover");
const contentInput = document.querySelector("#content");
const passwordInput = document.querySelector("#password");
const list = document.querySelector("#articleList");
const submitBtn = document.querySelector("#submit");
const updateBtn = document.querySelector("#update");
const deleteBtn = document.querySelector("#delete");
let currentTitle = "";
// 获取文章列表
async function loadArticles() {
    const res = await fetch("/api/passage");
    const data = await res.json();
    list.innerHTML = "";
    data.data.forEach((article) => {
        const li = document.createElement("li");
        li.innerText = article.title;
        li.onclick = () => {
            loadArticle(article.title);
        };
        list.appendChild(li);
    });
}
// 获取单篇文章
async function loadArticle(title) {
    const res = await fetch(`/api/passage/${encodeURIComponent(title)}`);
    const data = await res.json();
    currentTitle = data.title;
    titleInput.value = data.title;
    coverInput.value = data.cover;
    contentInput.value = data.content;
}
// 新增
submitBtn.onclick = async () => {
    const body = {
        title: titleInput.value,
        cover: coverInput.value,
        content: contentInput.value,
        password: passwordInput.value
    };
    const res = await fetch("/api/passage", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    const data = await res.json();
    alert(data.message);
    loadArticles();
};
// 修改
updateBtn.onclick = async () => {
    if (!currentTitle) {
        alert("请选择文章");
        return;
    }
    const body = {
        newTitle: titleInput.value,
        cover: coverInput.value,
        content: contentInput.value,
        password: passwordInput.value
    };
    const res = await fetch(`/api/passage/${encodeURIComponent(currentTitle)}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });
    const data = await res.json();
    alert(data.message);
    loadArticles();
};
// 删除
deleteBtn.onclick = async () => {
    if (!currentTitle) {
        alert("请选择文章");
        return;
    }
    const res = await fetch(`/api/passage/${encodeURIComponent(currentTitle)}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            password: passwordInput.value
        })
    });
    const data = await res.json();
    alert(data.message);
    loadArticles();
};
loadArticles();
export {};
//# sourceMappingURL=admin-passage.js.map