function togglePanel() {
    const login = document.getElementById("login-panel");
    const register = document.getElementById("register-panel");
    if (!login || !register)
        return;
    if (login.style.display === 'none') {
        register.style.display = 'none';
        login.style.display = "block";
    }
    else {
        login.style.display = 'none';
        register.style.display = "block";
    }
}
async function handleLogin() {
    const username = document.querySelector("#login-username")?.value;
    const password = document.querySelector("#login-password")?.value;
    if (!username || !password) {
        alert("不能输入空白");
        return;
    }
    const body = {
        username: username,
        password: password,
    };
    const response = await fetch("/api/auth/login", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    if (data.status === "success") {
        window.location.href = '/about';
    }
    else {
        alert(data.message);
    }
}
async function handleRegister() {
    const username = document.querySelector("#register-username")?.value;
    const password = document.querySelector("#register-password")?.value;
    if (!username || !password) {
        alert("不能输入空白");
        return;
    }
    const body = {
        username: username,
        password: password
    };
    const response = await fetch("/api/auth/register", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
    const data = await response.json();
    if (data.status === "success") {
        window.location.href = '/about';
    }
    else {
        alert(data.message);
    }
}
async function Logout() {
    try {
        const response = await fetch("/api/auth/logout", {
            method: 'POST',
        });
        if (response.ok) {
            window.location.href = '/login';
        }
    }
    catch (error) {
        console.error("登出错误:", error);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-login')?.addEventListener('click', handleLogin);
    document.getElementById('btn-register')?.addEventListener('click', handleRegister);
    // 给两个切换面板的 a 标签都绑定 togglePanel
    document.getElementById('link-to-register')?.addEventListener('click', togglePanel);
    document.getElementById('link-to-login')?.addEventListener('click', togglePanel);
    document.getElementById('logoutBtn')?.addEventListener('click', Logout);
});
export {};
//# sourceMappingURL=login.js.map