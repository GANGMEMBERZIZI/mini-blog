import {isLogged} from "./comment.js";
const sendBtn=document.querySelector<HTMLButtonElement>("#sendBtn");
const iconArrow = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>`;
const iconStop = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="7" width="10" height="10" rx="1.5"/></svg>`;
sendBtn!.innerHTML=iconArrow;
let isGenerating=false;
let currentControl: AbortController | null = null;
interface historyData {
    data:history[];
}
interface history{
     role: string; 
     content: string 
}
interface history{
    role:string,
    content:string,
    attachments?:string[]
}
function parseContent(text: string): string {
    let safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    safeText = safeText.replace(
        /\[FILE_CONTENT_START:\s*(.*?)\][\s\S]*?\[FILE_CONTENT_END\]/g,
        '<div style="display:inline-block; padding:4px 8px; background:#2d2d2d; color:#10a37f; border-radius:4px; font-size:12px; margin:4px 0; border: 1px solid #10a37f;">📄 附件代码: $1 (已解析)</div>'
    );
    safeText = safeText.replace(/!\[.*?\]\((.*?)\)/g, '<img src="$1" style="max-width:200px; border-radius:8px; display:block; margin-top:5px;" />');
    return safeText.replace(/\n/g, '<br/>');
}
async function aichat() {
    try{
        const userMessager=document.querySelector<HTMLTextAreaElement>("#chatInput");
        const fileInput = document.querySelector<HTMLInputElement>("#fileInput");
        const userMessage=document.querySelector<HTMLTextAreaElement>("#chatInput")!.value;
        const files = fileInput!.files;
        if (!userMessage && (!files || files.length === 0)) return;
        isGenerating=true;
        sendBtn!.innerHTML=iconStop;
        const chatbox=document.getElementById("chatbox");
        const p=document.createElement('div');
        currentControl=new AbortController();
        p.className = 'user-msg';
        p.innerText=userMessage;
        if (files && files.length > 0) {
            const fileContainer = document.createElement('div');
            fileContainer.style.display = 'flex';
            fileContainer.style.flexWrap = 'wrap';
            fileContainer.style.gap = '8px';
            fileContainer.style.marginTop = '8px';
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file?.type.startsWith('image/')) {
                    const img = document.createElement('img');
                    img.src = URL.createObjectURL(file);
                    img.style.maxWidth = '100px';
                    img.style.borderRadius = '8px';
                    fileContainer.appendChild(img);
                } else {
                    const badge = document.createElement('div');
                    badge.style.cssText = 'padding:4px 8px; background:#2d2d2d; color:#fff; border-radius:4px; font-size:12px;';
                    badge.innerText = `📄 ${file?.name}`;
                    fileContainer.appendChild(badge);
                }
            }
            p.appendChild(fileContainer);
        }
        chatbox!.appendChild(p);
        chatbox!.scrollTop = chatbox!.scrollHeight;
        userMessager!.value="";
        if (fileInput) fileInput.value = "";
        const ai=document.createElement('div');
        ai.className = 'sena-msg';
        chatbox!.appendChild(ai);
        const formData=new FormData();
        formData.append("message", userMessage);
        if (files) {
            for (let i = 0; i < files.length; i++) {
                formData.append("files", files[i]!);
            }
        }
        console.log(formData)
        const response=await fetch("/api/chat",{
            method:"POST",
            credentials: 'include',
            body:formData,
            signal:currentControl.signal
        });
            const reader=response.body!.getReader();//得到水管
            const decoder=new TextDecoder("utf-8");
            let fullReply = "";
            while (true) {
            const { done, value } = await reader.read();// done表示是否完成 value 是二进制字节流
            //如果后端执行了 res.end()，这里的 done 就会变成 true
            if (done) {
                ai.innerHTML = parseContent(fullReply);
                break; 
            }          
            const chunkText = decoder.decode(value, { stream: true });//解码成中文 中文是3个字节 英文字母是1个字节 stream:true 是防止乱码
            fullReply += chunkText;
            ai.innerText = fullReply; 
            chatbox!.scrollTop = chatbox!.scrollHeight; 
        }      
    }
    catch(error){
        if(error instanceof DOMException && error.name==="AbortError"){
            console.log("手动解除");
            const chatbox = document.getElementById("chatbox");
            // Safely handle possible nulls: chatbox or its lastChild may be null or not an HTMLElement
            if (chatbox && chatbox.lastChild instanceof HTMLElement) {
                chatbox.lastChild.innerText += "已停止生成";
            } else if (chatbox) {
                // If lastChild is missing or not an element, append a new message element
                const p = document.createElement('p');
                p.className = 'sena-msg';
                p.innerText = '已停止生成';
                chatbox.appendChild(p);
            }
        }else{
        console.error("连接失败",error);
        }
    }
    finally{
        sendBtn!.innerHTML=iconArrow;
        isGenerating=false;
        currentControl=null;
    }
}
sendBtn!.onclick=function(){//手动发 
    if(isGenerating){
        if(currentControl){
            currentControl.abort();
        }
    }else{
    aichat();
    }
 };
 const chatInput=document.getElementById("chatInput");
 chatInput!.addEventListener("keydown",function(event){
    if(event.key=="Enter"){
        if(!event.shiftKey){//检测摁enter 的时候 shift 摁住了吗
        event.preventDefault();
        if(isGenerating){
        if(currentControl){
            currentControl.abort();
        }
    }else{
    aichat();
    }
}
    }
});
async function renderHistory() {
    try{
        const response=await fetch("/api/chat",{
            method:'GET',
            credentials: 'include'
        });
        const historyData:historyData=await response.json();
        const chatbox=document.querySelector<HTMLDivElement>("#chatbox");
        chatbox!.innerHTML="";
        historyData.data.forEach((msg:history) => {
            const p = document.createElement('div');
            p.className = msg.role === 'user' ? 'user-msg' : 'sena-msg';
            p.innerHTML = parseContent(msg.content);
            if (msg.attachments && msg.attachments.length > 0) {
                const attachContainer = document.createElement('div');
                attachContainer.style.display = 'flex';
                attachContainer.style.flexWrap = 'wrap';
                attachContainer.style.gap = '8px';
                attachContainer.style.marginTop = '8px';
                msg.attachments.forEach(url => {
                    const ext = url.split('.').pop()?.toLowerCase();
                    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
                        const img = document.createElement('img');
                        img.src = url;
                        img.style.maxWidth = '200px';
                        img.style.borderRadius = '8px';
                        attachContainer.appendChild(img);
                    } else {
                        const link = document.createElement('a');
                        link.href = url;
                        link.target = '_blank';
                        link.innerText = '📦 下载附件';
                        link.style.cssText = 'padding:4px 8px; background:#1e1e1e; color:#0a84ff; border-radius:4px; text-decoration:none; font-size:12px; border: 1px solid #0a84ff; display: inline-block;';
                        attachContainer.appendChild(link);
                    }
                });
                p.appendChild(attachContainer);
            }
            chatbox!.appendChild(p);
        });
        chatbox!.scrollTop = chatbox!.scrollHeight;
    }
    catch(error){
        console.error("读取失败:", error);
    }
}
document.addEventListener("DOMContentLoaded", async () => {
    renderHistory(); 
});