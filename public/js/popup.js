/**
 * Created by root on 22/02/17.
 */
var popupBox = document.getElementsByClassName("login-popup")[0];
var loginBtn = document.getElementById('login');
var span = document.getElementsByClassName('close')[0];
var submitLoginBtn = document.getElementsByClassName('login-button')[0];

loginBtn.onclick = function() {
    popupBox.style.display = 'block';
}

span.onclick = function () {
    popupBox.style.display = 'none';
}

window.onclick = function(event) {
    if(event.target == popupBox) {
        popupBox.style.display = 'none';
    }
}

submitLoginBtn.onclick = function() {
    var loginInfo = {};

    var userName = document.getElementsByName('user-name')[0].value;
    var passwword = document.getElementsByName('password')[0].value;

    loginInfo['password'] = passwword;
    loginInfo['userName'] = userName;

    console.log(loginInfo);
    return loginInfo;
}