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
async function aichat() {
    try{
        const userMessager=document.querySelector<HTMLTextAreaElement>("#chatInput");
        const userMessage=document.querySelector<HTMLTextAreaElement>("#chatInput")!.value;
        if (!userMessage) return;
        isGenerating=true;
        sendBtn!.innerHTML=iconStop;
        const chatbox=document.getElementById("chatbox");
        const p=document.createElement('p');
        currentControl=new AbortController();
        p.className = 'user-msg';
        p.innerText=userMessage;
        chatbox!.appendChild(p);
        userMessager!.value="";
        const ai=document.createElement('p');
        ai.className = 'sena-msg';
        chatbox!.appendChild(ai);
        // const currentToken = localStorage.getItem('quantum_token');
        const response=await fetch("/api/chat",{
            method:"POST",
            headers:{
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body:JSON.stringify({
                message:userMessage
            }),
            signal:currentControl.signal
        });
            const reader=response.body!.getReader();//得到水管
            const decoder=new TextDecoder("utf-8");
            while (true) {
            const { done, value } = await reader.read();// done表示是否完成 value 是二进制字节流
            //如果后端执行了 res.end()，这里的 done 就会变成 true
            if (done) {
                break; 
            }          
            const chunkText = decoder.decode(value, { stream: true });//解码成中文 中文是3个字节 英文字母是1个字节 stream:true 是防止乱码
            ai.innerText += chunkText; 
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
            const p = document.createElement('p');
            if (msg.role === 'user') {
                p.className = 'user-msg';
            } else {
                p.className = 'sena-msg';
            }
            p.innerText = msg.content;
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