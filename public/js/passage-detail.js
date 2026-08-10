import { marked } from "marked";
import DOMPurify from "dompurify";
async function loadPassage() {
    try {
        const title = decodeURIComponent(location.pathname.split("/")[2]);
        const response = await fetch(`/api/passage/${encodeURIComponent(title)}`);
        const data = await response.json();
        let main = document.querySelector(".main");
        if (main) {
            main.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${data.cover})`;
            main.style.backgroundSize = "cover";
            main.style.backgroundPosition = "center";
        }
        const maintopic = document.querySelector(".maintopic");
        const HTML = await marked.parse(data.content);
        const cleanHTML = DOMPurify.sanitize(HTML);
        maintopic.innerHTML = `<div class="markdown-body">${cleanHTML}</div>`;
    }
    catch (error) {
        console.log(`load错误,${error}`);
    }
}
loadPassage();
//# sourceMappingURL=passage-detail.js.map