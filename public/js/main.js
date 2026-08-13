//Navigation Bar
const article = document.getElementById("article");
if (article) {
    article.addEventListener("click", (event) => {
        event.preventDefault();
        window.location.href = '/post';
    });
}
const anime = document.getElementById("anime");
if (anime) {
    anime.addEventListener("click", (event) => {
        event.preventDefault();
        window.location.href = '/anime';
    });
}
const game = document.getElementById("game");
if (game) {
    game.addEventListener("click", (event) => {
        event.preventDefault();
        window.location.href = '/game';
    });
}
document.addEventListener("DOMContentLoaded", () => {
    const theme_toggle = document.querySelector("#theme-toggle");
    const theme_icon = document.getElementById("theme-icon");
    if (!theme_toggle || !theme_icon) {
        return;
    }
    const sun = "ri-sun-line";
    const moon = "ri-moon-line";
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
        document.body.classList.add("dark-theme");
        theme_icon.classList.replace(moon, sun);
    }
    theme_toggle.addEventListener("click", (e) => {
        e.preventDefault();
        const isdark = document.body.classList.toggle("dark-theme");
        if (isdark) {
            theme_icon.classList.replace(moon, sun);
            localStorage.setItem("theme", "dark");
        }
        else {
            theme_icon.classList.replace(sun, moon);
            localStorage.setItem("theme", "light");
        }
    });
});
//background
function get_random(N, M) {
    return Math.floor(Math.random() * (M - N + 1)) + N;
}
let random = get_random(1, 4);
let main = document.querySelector(".main");
if (!main) {
    throw new Error("不存在main");
}
main.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(/img/${random}.png)`;
//video
const cards = document.querySelectorAll('.text ul li');
cards.forEach(card => {
    const video = card.querySelector('.mg');
    if (!video)
        return;
    card.addEventListener('mouseenter', () => {
        video.style.opacity = '1';
        video.play().catch((err) => {
            if (err.name !== 'AbortError') {
                console.error('Video play error:', err);
            }
        });
    });
    card.addEventListener('mouseleave', () => {
        video.style.opacity = '0';
        video.pause();
        video.currentTime = 0;
    });
});
//upper
const up = document.querySelector(".upper");
if (!up)
    throw new Error("upper not found");
window.addEventListener("scroll", () => {
    const depth = window.scrollY;
    if (depth > 100) {
        up.classList.add("active");
    }
    else {
        up.classList.remove("active");
    }
});
up.addEventListener("click", () => {
    const targetPosition = 0;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    let startTime = null;
    function animation(currentTime) {
        if (startTime === null)
            startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const duration = 500;
        const progress = Math.min(timeElapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        window.scrollTo(0, startPosition + distance * ease);
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }
    requestAnimationFrame(animation);
});
//sakura
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
//# sourceMappingURL=main.js.map