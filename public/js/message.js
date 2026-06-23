async function fetchHitokoto() {
    const hitokoto = document.querySelector("#hitokoto_text");
    if (!hitokoto)
        return;
    try {
        const response = await fetch("https://v1.hitokoto.cn/?c=d");
        const data = await response.json();
        hitokoto.href = `https://hitokoto.cn/?uuid=${data.uuid}`;
        hitokoto.innerText = data.hitokoto;
    }
    catch (error) {
        console.error(error);
        hitokoto.removeAttribute("href");
        hitokoto.innerText = "error";
    }
}
fetchHitokoto();
export {};
//# sourceMappingURL=message.js.map