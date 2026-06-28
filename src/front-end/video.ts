	const cards=document.querySelectorAll<HTMLLIElement>('.text ul li');
	cards.forEach(card=>{
	    const video=card.querySelector<HTMLVideoElement>('.mg');
	    if(!video)
	        return;
	    card.addEventListener('mouseenter',()=>{
	        video.style.opacity='1';
	        video.play().catch((err:DOMException)=>{
	            if(err.name!=='AbortError'){
	                console.error('Video play error:',err);
	            }
	        });
	    });
	    card.addEventListener('mouseleave', () => {
	    video.style.opacity = '0';
	    video.pause();
	    video.currentTime = 0;
	  });
	});
