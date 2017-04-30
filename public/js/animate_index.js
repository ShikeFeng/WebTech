'use strict';

var story_2_1_title = document.getElementById("story-2-1-title");
var story_2_1_desc = document.getElementById("story-2-1-desc");

function displayDesc(){
	story_2_1_title.style.visibility = "hidden";
	story_2_1_desc.style.visibility = "visible";
	fadeIn(story_2_1_desc);
	// fadeOut(story_2_1_title);
}

function displayTitle(){
	fadeOut(story_2_1_desc);
	story_2_1_desc.style.visibility = "hidden";
	story_2_1_title.style.visibility = "visible";
	fadeIn(story_2_1_title);
}

function fadeIn(el){
  el.style.opacity = 0;
  var tick = function(){
  	el.style.opacity = +el.style.opacity + 0.01;
  	if (+el.style.opacity < 1){
      (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16)
    }
  };
  tick();
}

function fadeOut(el){
	el.style.opacity = 1;
	var tick = function(){
		el.style.opacity = -el.style.opacity - 0.01;
		if(-el.style.opacity > 0){
			(window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16) 
		}
	};
	tick();
}