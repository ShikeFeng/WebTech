/**
 * Created by root on 22/02/17.
 */
var popupModal = document.getElementsByClassName('popup-modal')[0];
var loginLink = document.getElementById('signup');
var span = document.getElementsByClassName('close')[0];

loginLink.onclick = function () {
    popupModal.style.display = 'block';
}

span.onclick = function () {
    popupModal.style.display = 'none';
}

window.onclick = function (event) {
    if(event.target == popupModal) {
        popupModal.style.display = 'none';
    }
}

function login() {
    console.log("called this function!");
    var userInfo = {};
    var userName = document.getElementsByClassName('user-name')[0].value;
    var password = document.getElementsByClassName('password')[0].value;

    userInfo['userName'] = userName;
    userInfo['password'] = password;

    sendRequest('POST', '/login', true, userInfo);
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

// Animation
$('.message a').click(function(){
    $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
});
