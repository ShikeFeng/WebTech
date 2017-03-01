/**
 * Created by root on 22/02/17.
 */
var popupBox = document.getElementsByClassName("login-popup")[0];
var loginBtn = document.getElementById('login');
var span = document.getElementsByClassName('close')[0];

loginBtn.onclick = function() {
    popupBox.style.display = 'block';
}

span.onclick = function () {
    popupBox.style.display = 'none';
}

window.onclick = function(event) {
    if(event.target == popupBox) {
        popupBox.style.display = "none";
    }
}

window.onload = function() {
    var q = new XMLHttpRequest();
    console.log(q);
}