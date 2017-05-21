'use strict';

var titleText = document.getElementById('titleText');
var titleCharLeft = document.getElementById('titleCharLeft');
var introText = document.getElementById('introText');
var introCharLeft = document.getElementById('introCharLeft');

titleText.addEventListener('keyup', charLeftTitle);
introText.addEventListener('keyup', charLeftIntro);

function charLeftTitle(){
  var numTextLeft = 50 - titleText.value.length;
  titleCharLeft.innerHTML = numTextLeft.toString();
}

function charLeftIntro(){
  var numTextLeft = 100 - introText.value.length;
  introCharLeft.innerHTML = numTextLeft.toString();
}
