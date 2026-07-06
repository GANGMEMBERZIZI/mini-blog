const format=(time:number):string=>String(time).padStart(2,"0");
const start=new Date("2024-05-01T00:00:00");
export function initUptime(): void{
    const time=document.querySelector<HTMLDivElement>("#uptime_screen");
    if(!time)
        return ;
function startup():void{
    const totalseconds=Math.floor((Date.now()-start.getTime())/1000);
    const days= Math.floor(totalseconds / (3600 * 24));
    const hours= Math.floor((totalseconds % (3600 * 24)) / 3600);
    const minutes=Math.floor((totalseconds % 3600)/60);
    const seconds=totalseconds % 60;
    const text:string=`${days} 天 ${format(hours)} 小时 ${format(minutes)} 分钟 ${format(seconds)} 秒`;
    time!.innerText=text;
}
setInterval(startup,1000);
startup();
}