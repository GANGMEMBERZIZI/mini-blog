import {updatePaginationUI} from "./common.js";
interface article_data{
    currentPage:number;
    totalPages:number;
    totalArticles:number;
    data:string[];
}
interface article{
    content:string;
}
const container1=document.querySelector<HTMLUListElement>(".text ul");
const prevBtn=document.querySelector<HTMLButtonElement>(".prev-page");
const nextBtn=document.querySelector<HTMLButtonElement>(".next-page");
const pageinfo=document.querySelector<HTMLSpanElement>(".page-info");
let currentPage=1;
let totalPage=1;
async function loadArticleList(page:number=1){
    try{
        const response=await fetch(`/api/posts?page=${page}&limit=4`);
        const result:article_data=await response.json();
        currentPage=result.currentPage;
        totalPage=result.totalPages;
        container1!.innerHTML='';
        const fragment=new DocumentFragment();
        result.data.forEach(title=>{
            const li=document.createElement('li');
            const titlediv=document.createElement('div');
            titlediv.className="passagetitle";
            const titleH3 = document.createElement('h3');
            titleH3.innerText=title;
            titlediv.appendChild(titleH3);
            const contentdiv=document.createElement('div');
            contentdiv.className="content";
            const readBtn=document.createElement('button');
            readBtn.innerText="展开";
            readBtn.className="fold";
            readBtn.style.cursor="pointer";
            readBtn.addEventListener('click',async ()=>{
                readBtn.innerText="获取中:D";
                readBtn.disabled=true;
                try{
                    const response=await fetch(`/api/posts/${encodeURIComponent(title)}`);
                    const article:article=await response.json();
                    contentdiv.innerHTML='';
                    const textNode=document.createElement('p');
                    if(!article.content){
                        console.log("没有返回内容");
                    }else{
                    textNode.innerText=article.content;
                    textNode.style.whiteSpace = 'pre-wrap'; 
                    textNode.style.lineHeight = '1.6';
                    }
                    const collapseBtn=document.createElement('button');
                    collapseBtn.className="unfold";
                    collapseBtn.innerText="收起";
                    collapseBtn.addEventListener("click",()=>{
                        contentdiv.innerHTML = '';
                        readBtn.innerText="展开";
                        readBtn.disabled=false;
                        contentdiv.appendChild(readBtn);
                    });
                    contentdiv.appendChild(textNode);
                    contentdiv.appendChild(collapseBtn);
                }
                catch(error){
                    console.log("读取失败，重试");
                }
        });
        contentdiv.appendChild(readBtn);
            li.appendChild(titlediv);
            li.appendChild(contentdiv);
            fragment.appendChild(li);
            });
            container1!.appendChild(fragment);
            updatePaginationUI({currentPage,totalPage,pageinfo,prevBtn,nextBtn});

}
    catch(error){
        console.error("加载列表失败：", error);
    }
}
prevBtn!.addEventListener("click",()=>{
    if(currentPage>1){
        loadArticleList(currentPage-1);
    }
});
nextBtn!.addEventListener("click",()=>{
    if(currentPage<totalPage){
        loadArticleList(currentPage+1);
    }
});
window.addEventListener("DOMContentLoaded",()=>{
    loadArticleList(1);
});