const container1=document.querySelector<HTMLUListElement>(".text ul");
export const container=document.querySelector<HTMLDivElement>("#container");
export const prevBtn=document.querySelector<HTMLButtonElement>(".prev-page");
export const nextBtn=document.querySelector<HTMLButtonElement>(".next-page");
export const pageinfo=document.querySelector<HTMLSpanElement>(".page-info");
interface Passage{
    title:string;
    cover:string;
    summary:string;
    time:string;
    created_at:string;
};
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
let currentPage=1;
let totalPage=1;
async function loadPassages(page:number=1){
    try{
        const response=await fetch(`/api/passage?page=${page}&limit=4`);
        const result=await response.json();
        currentPage=result.currentPage;
        totalPage=result.totalPages;
        container1!.innerHTML='';
        const fragment=new DocumentFragment();
        result.data.forEach((article: Passage)=>{
          const li=document.createElement('li');
          li.className="article";
          const cover=document.createElement('div');
          cover.className='articleCover';
          const img=document.createElement('img');
          img.src=article.cover;
          img.alt=article.title;
          cover.appendChild(img);
          const titlediv=document.createElement('div');
          titlediv.className='articleTitle';
          const titleH3=document.createElement('h3');
          titleH3.innerText=article.title;
          titlediv.appendChild(titleH3);
          const contentDiv=document.createElement('div');
          contentDiv.className='articleContent';
          const content=document.createElement('p');
          content.innerText=article.summary;
          contentDiv.appendChild(content);
          const data=document.createElement('div');
          data.className='articleData';
          const time=document.createElement('span');
          time.innerHTML = `<svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${new Date(article.time)
    .toISOString()
    .slice(0,10)}`;
          data.appendChild(time);
          li.appendChild(cover);
          li.appendChild(titlediv);
          li.appendChild(contentDiv);
          li.appendChild(data);
          li.addEventListener('click',()=>{
            window.location.href=`/passage/${encodeURIComponent(article.title)}`;
          });
          fragment.appendChild(li);
        });
        container1!.appendChild(fragment);
        updatePaginationUI({currentPage,totalPage,pageinfo,prevBtn,nextBtn});
    }
    catch(error){
      console.log("读取失败，重试");
    }
}
prevBtn!.addEventListener("click",()=>{
    if(currentPage>1){
        loadPassages(currentPage-1);
    }
});
nextBtn!.addEventListener("click",()=>{
    if(currentPage<totalPage){
        loadPassages(currentPage+1);
    }
});
window.addEventListener("DOMContentLoaded",()=>{
    loadPassages(1);
});