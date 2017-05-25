'use strict';

function getStoryTitle(story){
	var storyTitle = '';

	storyTitle = "title" + story;

	return storyTitle;
}

function getStoryDesc(story){
	var storyDesc = '';

	storyDesc = "desc" + story

	return storyDesc;
}

function displayDesc(story){
	var storyTitleEl;
	var storyDescEl;	
	
	var storyTitle = '';
	var storyDesc = '';

	storyTitle = getStoryTitle(story);
	storyDesc = getStoryDesc(story);

	storyTitleEl = document.getElementsByName(storyTitle)[0];
	storyDescEl = document.getElementsByName(storyDesc)[0];

	storyTitleEl.style.display = "none";
	storyDescEl.style.display = "block";
	
	fadeIn(storyDescEl);
}

function displayTitle(story){
	var storyTitleEl;
	var storyDescEl;	
	
	var storyTitle = '';
	var storyDesc = '';

	storyTitle = getStoryTitle(story);
	storyDesc = getStoryDesc(story);

	storyTitleEl = document.getElementsByName(storyTitle)[0];
	storyDescEl = document.getElementsByName(storyDesc)[0];

	storyDescEl.style.display = "none";
	storyTitleEl.style.display = "block";

    //console.log("I am already displaying the title!");
	fadeIn(storyTitleEl);
}

function fadeIn(el){
  el.style.opacity = 0;
  var tick = function(){
  	el.style.opacity = +el.style.opacity + 0.03;
  	if (+el.style.opacity < 1){
      (window.requestAnimationFrame && requestAnimationFrame(tick)) || setTimeout(tick, 16)
    }
  };
  tick();
}