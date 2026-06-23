const up=document.querySelector<HTMLDivElement>(".upper");
if(!up)
    throw new Error("upper not found");
window.addEventListener("scroll",()=>{
    const depth=window.scrollY;
    if(depth>100){
        up.classList.add("active");
    }else{
        up.classList.remove("active");
    }
});
up.addEventListener("click", () => {
    const targetPosition = 0; 
    const startPosition = window.scrollY; 
    const distance = targetPosition - startPosition;
    let startTime:number|null = null;
    function animation(currentTime:number) {
        if (startTime === null) startTime = currentTime;
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
