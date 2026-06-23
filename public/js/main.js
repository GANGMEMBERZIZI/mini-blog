function get_random(N, M) {
    return Math.floor(Math.random() * (M - N + 1)) + N;
}
let random = get_random(1, 4);
let main = document.querySelector(".main");
if (!main) {
    throw new Error("不存在main");
}
main.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(./img/${random}.png)`;
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
        theme_icon.classList.replace(moon, sun); //记录
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
export {};
//# sourceMappingURL=main.js.map