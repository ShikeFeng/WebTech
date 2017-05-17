'use strict';

function getStoryTitle(story){
	var storyTitle = '';

	if(story == 1){
		storyTitle = "story-2-1-title";
	} else if(story == 2){
		storyTitle = "story-2-2-title";
	} else if(story == 3){
		storyTitle = "story-2-3-title";
	} else {
		storyTitle = "story-2-4-title";
	}

	return storyTitle;
}

function getStoryDesc(story){
	var storyDesc = '';

	if(story == 1){
		storyDesc = "story-2-1-desc";
	} else if(story == 2){
		storyDesc = "story-2-2-desc";
	} else if(story == 3){
		storyDesc = "story-2-3-desc";
	} else {
		storyDesc = "story-2-4-desc";
	}

	return storyDesc;
}

function displayDesc(story){
	var storyTitleEl;
	var storyDescEl;	
	
	var storyTitle = '';
	var storyDesc = '';

	storyTitle = getStoryTitle(story);
	storyDesc = getStoryDesc(story);

	storyTitleEl = document.getElementById(storyTitle);
	storyDescEl = document.getElementById(storyDesc);

	storyTitleEl.style.display = "none";
	storyDescEl.style.display = "block";
	
	fadeIn(storyDescEl);
	fadeOut(storyTitleEl);
}

function displayTitle(story){
	var storyTitleEl;
	var storyDescEl;	
	
	var storyTitle = '';
	var storyDesc = '';

	storyTitle = getStoryTitle(story);
	storyDesc = getStoryDesc(story);

	storyTitleEl = document.getElementById(storyTitle);
	storyDescEl = document.getElementById(storyDesc);

	storyDescEl.style.display = "none";
	storyTitleEl.style.display = "block";
	
	fadeIn(storyDescEl);
	fadeOut(storyTitleEl);
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