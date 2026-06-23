const sk = document.querySelector(".sk");
if (!sk)
    throw new Error("sk不存在");
sk.onmousedown = function (event) {
    let shiftX = event.clientX - sk.getBoundingClientRect().left;
    let shiftY = event.clientY - sk.getBoundingClientRect().top;
    sk.style.zIndex = String(1000);
    function moveAt(clientX, clientY) {
        const footer = document.querySelector(".footer");
        if (!footer)
            return;
        let newleft = clientX - shiftX;
        let newtop = clientY - shiftY;
        let maxRight = document.documentElement.clientWidth - sk.offsetWidth;
        let footerRect = footer.getBoundingClientRect().top + footer.offsetHeight;
        let maxBottom = document.documentElement.clientHeight - sk.offsetHeight;
        if (footerRect < document.documentElement.clientHeight) {
            maxBottom = footerRect - sk.offsetHeight;
        }
        if (newleft < 0)
            newleft = 0;
        if (newleft > maxRight)
            newleft = maxRight;
        if (newtop < 0)
            newtop = 0;
        if (newtop > maxBottom)
            newtop = maxBottom;
        sk.style.left = newleft + 'px';
        sk.style.top = newtop + 'px';
    }
    moveAt(event.clientX, event.clientY); //初始化
    function onMouseMove(event) {
        moveAt(event.clientX, event.clientY);
    }
    document.addEventListener("mousemove", onMouseMove);
    document.onmouseup = function () {
        document.removeEventListener("mousemove", onMouseMove);
        sk.style.position = "fixed";
        document.onmouseup = null;
    };
};
sk.ondragstart = function () {
    return false;
};
export {};
//# sourceMappingURL=button.js.map