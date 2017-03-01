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

window.onload = function(){
    var q = new XMLHttpRequest();
    q.onreadystatechange = receive;
    var p = {
        "username": "Robert",
        "password": 123456
    }
    alert(JSON.stringify(p));
    q.open("POST", "/", true);
    q.send(JSON.stringify(p));
    function receive() {
        if (this.readyState == 4 && this.status == 200) {
            alert(this.responseText);
       }
    };
}
