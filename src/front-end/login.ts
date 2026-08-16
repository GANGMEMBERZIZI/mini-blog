import type {crud_data} from "./admin-note.js";//type interface 用于编译时类型检查 运行消失 所以加type
interface request{
    username:string;
    password:string;
}
function togglePanel(){
    const login = document.getElementById("login-panel");
    const register = document.getElementById("register-panel");
    const change = document.getElementById("change-panel");
    //返回所有的btn selector只会抓取第一个
    const loginBtns = document.querySelectorAll(".link-to-login");
    const registerBtns = document.querySelectorAll(".link-to-register");
    const changeBtns = document.querySelectorAll(".link-to-change");
    const ignoreBtns=document.querySelectorAll(".link-to-ignore");
    //遍历所有的按钮
    loginBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            if(change) change.style.display = 'none';
            if(register) register.style.display = 'none';
            if(login) login.style.display = "block";
        });
    });
    registerBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            if(change) change.style.display = 'none';
            if(register) register.style.display = 'block';
            if(login) login.style.display = "none";
        });
    });
    changeBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            if(change) change.style.display = 'block';
            if(register) register.style.display = 'none';
            if(login) login.style.display = "none";
        });
    });
    ignoreBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            alert("草泥马的,你忘记密码让我怎么办?重新注册一个吧,傻逼支那人");
        });
    });
}
async function handleLogin(){
    const username=document.querySelector<HTMLInputElement>("#login-username")?.value;
    const password=document.querySelector<HTMLInputElement>("#login-password")?.value;
    if(!username||!password){
        alert("不能输入空白");
        return;
    }
    const body:request={
        username:username,
        password:password,
    }
    const response=await fetch("/api/auth/login",{
        method:'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    const data:crud_data = await response.json(); 
    if(data.status === "success"){
        window.location.href = '/about';
    } else {
        alert(data.message); 
    }
}
async function handleRegister(){
    const username=document.querySelector<HTMLInputElement>("#register-username")?.value;
    const password=document.querySelector<HTMLInputElement>("#register-password")?.value;
    if(!username||!password){
        alert("不能输入空白");
        return;
    }
    const body:request={
        username:username,
        password:password
    }
    const response=await fetch("/api/auth/register",{
        method:'POST',
        headers:{
            'Content-Type': 'application/json'
        },
        body:JSON.stringify(body)
    });
    const data:crud_data=await response.json();
    if(data.status === "success"){
        window.location.href = '/about';
    } else {
        alert(data.message); 
    }
}
async function handleChange(){
    const username=document.querySelector<HTMLInputElement>("#change-username")?.value;
    const oldpassword=document.querySelector<HTMLInputElement>("#change-oldpassword")?.value;
    const newpassword=document.querySelector<HTMLInputElement>("#change-newpassword")?.value;
    if(!username||!oldpassword||!newpassword){
        alert("不能输入空白");
        return;
    }
    if(oldpassword===newpassword){
        alert("旧密码和新密码不能重复");
        return;
    }
    const body={
        username:username,
        oldpassword:oldpassword,
        newpassword:newpassword
    }
    const response=await fetch("/api/auth/change",{
        method:'PUT',
        headers:{
            'Content-Type': 'application/json'
        },
        body:JSON.stringify(body)
    });
    const data=await response.json();
    if(data.status === "success"){
        window.location.href = '/login';
    } else {
        alert(data.message); 
    } 
}
async function Logout() {
    try{
        const response=await fetch("/api/auth/logout",{
            method:'POST',
        });
        if(response.ok){
            window.location.href='/login';
        }
    }
    catch(error){
        console.error("登出错误:", error);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-login')?.addEventListener('click', handleLogin);
    document.getElementById('btn-register')?.addEventListener('click', handleRegister);
    document.getElementById('btn-change')?.addEventListener('click',handleChange);
    togglePanel();
    document.getElementById('logoutBtn')?.addEventListener('click', Logout);
});