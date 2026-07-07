;
export class Sakura {
    el;
    setting;
    constructor(selector, option) {
        const element = document.querySelector(selector);
        if (!element)
            throw new Error("Element not found");
        this.el = element;
        const defaults = {
            className: 'sakura', // Classname of the petal. This corresponds with the css.
            fallSpeed: 1, // Speed factor in which the petal falls (higher is slower).
            maxSize: 14, // The maximum size of the petal.
            minSize: 10, // The minimum size of the petal.
            delay: 300, // Delay between petals.
            colors: [
                {
                    // You can add multiple colors (chosen randomly) by adding elements to the array.
                    gradientColorStart: 'rgba(255, 183, 197, 0.9)', // Gradient color start (rgba).
                    gradientColorEnd: 'rgba(255, 197, 208, 0.9)', // Gradient color end (rgba).
                    gradientColorDegree: 120, // Gradient degree angle.
                },
            ],
        };
        this.setting = {
            ...defaults,
            ...option //覆盖 默认配置
        };
    }
    randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    randomArrayElem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }
    prefixes = [
        "webkit",
        "moz",
        "MS",
        "o",
        ""
    ]; //只读 不能修改
    prefixedEvent(element, type, callback) {
        for (let p = 0; p < this.prefixes.length; p += 1) {
            let animType = type;
            if (!this.prefixes[p]) {
                animType = type.toLowerCase();
            }
            element.addEventListener(this.prefixes[p] + animType, callback, false);
        }
    }
    elementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <=
                (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth));
    }
    createPetal = () => {
        if (this.running) {
            setTimeout(() => {
                if (this.running) {
                    this.animId =
                        requestAnimationFrame(this.createPetal);
                }
            }, this.setting.delay);
        }
        // Name the animations. These have to match the animations in the CSS file.
        const animationNames = {
            blowAnimations: [
                'blow-soft-left',
                'blow-medium-left',
                'blow-soft-right',
                'blow-medium-right',
            ],
            swayAnimations: [
                'sway-0',
                'sway-1',
                'sway-2',
                'sway-3',
                'sway-4',
                'sway-5',
                'sway-6',
                'sway-7',
                'sway-8',
            ],
        };
        // Get one random animation of each type and randomize fall time of the petals
        const blowAnimation = this.randomArrayElem(animationNames.blowAnimations);
        const swayAnimation = this.randomArrayElem(animationNames.swayAnimations);
        const fallTime = (document.documentElement.clientHeight * 0.007 +
            Math.round(Math.random() * 5)) *
            this.setting.fallSpeed;
        // Create animations
        const animationsArr = [
            `fall ${fallTime}s linear 0s 1`,
            `${blowAnimation} ${(fallTime > 30 ? fallTime : 30) -
                20 +
                this.randomInt(0, 20)}s linear 0s infinite`,
            `${swayAnimation} ${this.randomInt(2, 4)}s linear 0s infinite`,
        ];
        const animations = animationsArr.join(', ');
        // Create petal and give it a random size.
        const petal = document.createElement('div');
        petal.classList.add(this.setting.className);
        const height = this.randomInt(this.setting.minSize, this.setting.maxSize);
        const width = height - Math.floor(this.randomInt(0, this.setting.minSize) / 3);
        // Get a random color.
        const color = this.randomArrayElem(this.setting.colors);
        petal.style.background = `linear-gradient(${color.gradientColorDegree}deg, ${color.gradientColorStart}, ${color.gradientColorEnd})`;
        petal.style.webkitAnimation = animations;
        petal.style.animation = animations;
        petal.style.borderRadius = `${this.randomInt(this.setting.maxSize, this.setting.maxSize + Math.floor(Math.random() * 10))}px ${this.randomInt(1, Math.floor(width / 4))}px`;
        petal.style.height = `${height}px`;
        petal.style.left = `${Math.random() * document.documentElement.clientWidth -
            100}px`;
        petal.style.marginTop = `${-(Math.floor(Math.random() * 20) + 15)}px`;
        petal.style.width = `${width}px`;
        // Remove petals of which the animation ended.
        this.prefixedEvent(petal, 'AnimationEnd', () => {
            if (!this.elementInViewport(petal)) {
                petal.remove();
            }
        });
        // Remove petals that float out of the viewport.
        this.prefixedEvent(petal, 'AnimationIteration', () => {
            if (!this.elementInViewport(petal)) {
                petal.remove();
            }
        });
        // Add the petal to the target element.
        this.el.appendChild(petal);
    };
    animId = null;
    running = false;
    start() {
        if (this.running) {
            throw new Error('Sakura is already running.');
        }
        else {
            this.running = true;
            this.animId = requestAnimationFrame(this.createPetal);
        }
    }
    stop(graceful = false) {
        this.running = false;
        if (this.animId != null) {
            cancelAnimationFrame(this.animId);
            this.animId = null;
        }
        if (!graceful) {
            setTimeout(() => {
                const petals = document.getElementsByClassName(this.setting.className);
                while (petals.length > 0) {
                    petals[0].remove();
                }
            }, this.setting.delay + 50);
        }
    }
}
window.Sakura = Sakura;
//# sourceMappingURL=sakura.js.map