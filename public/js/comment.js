const sub = document.querySelector("#subcomment");
export async function isLogged() {
    try {
        const response = await fetch("/api/auth/me", {
            credentials: 'include'
        });
        return response.ok;
    }
    catch (error) {
        console.log(`错误${error}`);
        return false;
    }
}
let totalcomments = 0;
document.addEventListener("DOMContentLoaded", async () => {
    const login = document.querySelector("#login-prompt-box");
    const comment = document.querySelector("#actual-input-box");
    if (!login || !comment) {
        console.log("为空");
        return;
    }
    if (await isLogged()) {
        login.style.display = 'none';
        comment.style.display = 'flex';
    }
    else {
        login.style.display = 'flex';
        comment.style.display = 'none';
    }
    loadComments();
});
async function loadComments() {
    try {
        const response = await fetch("/api/about");
        const result = await response.json();
        const commentsArray = result.data;
        totalcomments = result.totalComments;
        const totalComment = document.querySelector(".totalcomments");
        if (!totalComment) {
            return;
        }
        totalComment.innerText = `共有${totalcomments}条评论`;
        renderComments(commentsArray);
    }
    catch (error) {
        console.error("空间链路断裂，获取留言失败:", error);
    }
}
async function renderComments(commentsArray) {
    const container = document.querySelector(".commentcontent");
    if (!container) {
        console.log("container为空");
        return;
    }
    container.innerHTML = '';
    const currentuser = await getCurrentUser();
    commentsArray.forEach(comment => {
        const isAuthor = currentuser && currentuser.username === comment.nickname;
        const isAdmin = currentuser && currentuser.role === 'admin';
        let deleteBtnHTML = '';
        if (isAuthor || isAdmin) {
            deleteBtnHTML = `<button class="delete-btn" data-id="${comment.id}">删除</button>`;
        }
        const commentHTML = `
            <div class="comment-item">
                <div class="comment-header">
                    <span class="nickname">@${comment.nickname}</span>
                    <span class="time">${new Date(comment.created_at).toLocaleString()}</span>
                </div>
                <div class="comment-body">${comment.content}</div>
                <div class="comment-actions">${deleteBtnHTML}</div> 
            </div>
        `;
        container.innerHTML += commentHTML;
    });
    container.onclick = (event) => {
        const target = event.target;
        if (target.classList.contains("delete-btn")) {
            const commentId = target.getAttribute("data-id");
            if (commentId) {
                deleteComment(Number(commentId));
            }
        }
    };
}
async function getCurrentUser() {
    try {
        const response = await fetch("/api/auth/me", {
            credentials: 'include'
        });
        if (!response.ok)
            return null;
        return await response.json(); // 返回 { id, username, role }
    }
    catch (error) {
        console.error("未获取账号信息:", error);
        return null;
    }
}
async function submitComment() {
    const contentInput = document.querySelector("#comment-content");
    const content = contentInput.value;
    if (!content) {
        alert("请输入评论喵");
        return;
    }
    const body = {
        content: content
    };
    if (!(await isLogged())) {
        window.location.href = "/login";
        return;
    }
    //credentials: 'include' cookies
    const response = await fetch("/api/about", {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    if (data.status === "success") {
        contentInput.value = "";
        loadComments();
    }
    else {
        alert(data.message);
    }
}
async function deleteComment(commentId) {
    if (!(await isLogged())) {
        window.location.href = '/login';
        return;
    }
    const response = await fetch(`/api/about/${commentId}`, {
        method: 'DELETE',
        credentials: 'include'
    });
    const data = await response.json();
    if (data.status === 'success') {
        loadComments();
    }
    else {
        alert(data.message);
    }
}
sub.addEventListener("click", submitComment);
//# sourceMappingURL=comment.js.map