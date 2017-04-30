/**
 * Created by root on 22/02/17.
 */
'use strict'
var popupModal = document.getElementsByClassName('popup-modal')[0];
var signupLink = document.getElementById('signup');
var loginLink = document.getElementById('login');
var span = document.getElementsByClassName('close')[0];
var registerForm = document.getElementsByClassName('register-form')[0];
var loginForm = document.getElementsByClassName('login-form')[0];


signupLink.onclick = function () {
    loginForm.style.display = 'none';
    popupModal.style.display = 'block';
    registerForm.style.display = 'block';
}

loginLink.onclick = function () {
    registerForm.style.display = 'none';
    popupModal.style.display = 'block';
    loginForm.style.display = 'block';
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

function register(){
    // alert("Registration request");
    var userInfo = {}
    var userName = document.getElementsByClassName('register-username')[0].value;
    var password = document.getElementsByClassName('register-password')[0].value;
    var email = document.getElementsByClassName('register-email')[0].value;

    // alert("Got the value");
    if (!validator.isEmail(email)){
        alert("Not Valid email");
    }
    else {
      alert("Valid Email");
      userInfo['username'] = userName;
      userInfo['password'] = password;
      var validationResult = userInfoValidation(userInfo);
      // alert("Validated");
      if (validationResult.username === "valid" && validationResult.password === "valid"){
          sendRequest('POST', '/register', true, userInfo);
      }
      else {
        alert('Username : ' + validationResult.username);
        alert('Password : ' + validationResult.password);
      }
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

// Animation
$('.message a').click(function(){
    $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
});
