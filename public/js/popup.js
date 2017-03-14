/**
 * Created by root on 22/02/17.
 */
var popupBox = document.getElementsByClassName("login-popup")[0];
var loginLink = document.getElementById('login');
var span = document.getElementsByClassName('close')[0];
var loginBtn = document.getElementsByClassName('login-button')[0];

loginLink.onclick = function() {
    popupBox.style.display = 'block';
}

span.onclick = function () {
    popupBox.style.display = 'none';
}

loginBtn.onclick = function(){
    var userInfo = {};
    var userName = document.getElementsByClassName('usen-name')[0].value;
    var password = document.getElementsByClassName('password')[0].value;

    userInfo['userName'] = userName;
    userInfo['password'] = password;

    sendRequest('POST', '/login', true, userInfo);
}

window.onclick = function(event) {
    if(event.target == popupBox) {
        popupBox.style.display = 'none';
    }
}

function sendRequest(method, section, syncValue, data){
    var q = new XMLHttpRequest();
    q.onreadystatechange = receive;
    q.open(method, section, syncValue);
    q.send(JSON.stringify(data));
    function receive(){
        if (this.readyState == 4 && this.status == 200) {
            alert(this.responseText);
        }
    }
}