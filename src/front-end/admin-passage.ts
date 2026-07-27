interface Passage{
    title:string;
    cover:string;
    content:string;
}
const titleInput =document.querySelector<HTMLInputElement>("#title")!;
const coverInput =document.querySelector<HTMLInputElement>("#cover")!;
const contentInput =document.querySelector<HTMLTextAreaElement>("#content")!;
const passwordInput =document.querySelector<HTMLInputElement>("#password")!;
const list =document.querySelector<HTMLUListElement>("#articleList")!;
const submitBtn =document.querySelector<HTMLButtonElement>("#submit")!;
const updateBtn =document.querySelector<HTMLButtonElement>("#update")!;
const deleteBtn =document.querySelector<HTMLButtonElement>("#delete")!;
let currentTitle="";
async function loadArticles(){
    const res =await fetch("/api/passage");
    const data=await res.json();
    list.innerHTML="";
    data.data.forEach((article:Passage)=>{
        const li=document.createElement("li");
        li.innerText=article.title;
        li.onclick=()=>{
            loadArticle(article.title);
        };
        list.appendChild(li);
    });
}
async function loadArticle(title:string){
    const res =await fetch(
        `/api/passage/${encodeURIComponent(title)}`
    );
    const data=await res.json();
    currentTitle=data.title;
    titleInput.value=data.title;
    coverInput.value=data.cover;
    contentInput.value=data.content;
}
submitBtn.onclick=async()=>{
    const body={
        title:titleInput.value,
        cover:coverInput.value,
        content:contentInput.value,
        password:passwordInput.value
    };
    const res =await fetch("/api/passage",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(body)
    });
    const data=await res.json();
    alert(data.message);
    loadArticles();
};
updateBtn.onclick=async()=>{
    if(!currentTitle){
        alert("请选择文章");
        return;
    }
    const body={
        newTitle:titleInput.value,
        cover:coverInput.value,
        content:contentInput.value,
        password:passwordInput.value
    };
    const res =await fetch(`/api/passage/${encodeURIComponent(currentTitle)}`,
        {
        method:"PUT",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(body)
    });
    const data=await res.json();
    alert(data.message);
    loadArticles();
};
deleteBtn.onclick=async()=>{
    if(!currentTitle){
        alert("请选择文章");
        return;
    }
    const res =await fetch(`/api/passage/${encodeURIComponent(currentTitle)}`,
        {
        method:"DELETE",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({password:passwordInput.value})
    });
    const data=await res.json();
    alert(data.message);
    loadArticles();
};
loadArticles();