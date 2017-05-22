/**
 * Created by root on 22/02/17.
 */
'use strict';
var popupModal = document.getElementsByClassName('popup-modal')[0];
var signupLink = document.getElementById('signup');
var loginLink = document.getElementById('login');
var span = document.getElementsByClassName('close')[0];
var registerForm = document.getElementsByClassName('register-form')[0];
var loginForm = document.getElementsByClassName('login-form')[0];

var usernameText = document.getElementById('usernameText');
var passwordText = document.getElementById('passwordText');
var emailText = document.getElementById('emailText');

var usenameValidate = document.getElementById('usernameValidate');
var passwordValidate = document.getElementById('passwordValidate');
var emailValidate = document.getElementById('emailValidate');

usernameText.addEventListener('keyup', validate_username);
passwordText.addEventListener('keyup', validate_password);
emailText.addEventListener('keyup', validate_email);

function validate_username(){
  var text = usernameText.value;
  var validation = userNameValidation(text);
  switch (validation) {
    case 1:
      usernameValidate.innerHTML = "Length is Less Than 6";
      usernameValidate.style.color = "red";
      break;
    case 2:
      usernameValidate.innerHTML = "Length is Greater Than 12";
      usernameValidate.style.color = "red";
      break;
    case 3:
      usernameValidate.innerHTML = "Non-alphanumeric Characters Exist";
      usernameValidate.style.color = "red";
      break;
    default:
      usernameValidate.innerHTML = "Correct Format";
      usernameValidate.style.color = "green";
  }
}

function validate_password(){
  var text = passwordText.value;
  var validation = passwordValidation(text);
  switch (validation) {
    case 1:
      passwordValidate.innerHTML = "Length Less Than 10";
      passwordValidate.style.color = "red";
      break;
    case 2:
      passwordValidate.innerHTML = "Non-digits Less Than 2";
      passwordValidate.style.color = "red";
      break;
    case 3:
      passwordValidate.innerHTML = "Invalid Characters";
      passwordValidate.style.color = "red";
      break;
    default:
      passwordValidate.innerHTML = "Correct Format";
      passwordValidate.style.color = "green";
      break;
  }
}

function validate_email(){
  var text = emailText.value;
  if (!validator.isEmail(text)){
    emailValidate.innerHTML = "Invalid Email Address";
    emailValidate.style.color = "red";
  }
  else {
    emailValidate.innerHTML = "Correct Format";
    emailValidate.style.color = "green";
  }
}
if(signupLink != null){
    signupLink.onclick = function () {
        loginForm.style.display = 'none';
        popupModal.style.display = 'block';
        registerForm.style.display = 'block';
    }
}

if(loginLink != null){
    loginLink.onclick = function () {
        registerForm.style.display = 'none';
        popupModal.style.display = 'block';
        loginForm.style.display = 'block';
    }
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
    var userInfo = {};
    var userName = document.getElementsByClassName('user-name')[0].value;
    var password = document.getElementsByClassName('password')[0].value;
    alert(userName);
    alert(password);
    userInfo['username'] = userName;
    userInfo['password'] = password;

    var validationResult = userInfoValidation(userInfo);
    alert("Validated");
    if (validationResult.username === "valid" && validationResult.password === "valid"){
        var message = aesEncrypt_object(userInfo);
        sendRequest('POST', '/login', true, message);
    }
    else {
      alert('Username : ' + validationResult.username);
      alert('Password : ' + validationResult.password);
    }
}

// function register(){
//     // alert("Registration request");
//     var userInfo = {}
//     var userName = document.getElementsByClassName('register-username')[0].value;
//     var password = document.getElementsByClassName('register-password')[0].value;
//     var email = document.getElementsByClassName('register-email')[0].value;
//
//     // alert("Got the value");
//     if (!validator.isEmail(email)){
//         alert("Not Valid email");
//     }
//     else {
//       alert("Valid Email");
//       userInfo['username'] = userName;
//       userInfo['password'] = password;
//       var validationResult = userInfoValidation(userInfo);
//       // alert("Validated");
//       if (validationResult.username === "valid" && validationResult.password === "valid"){
//           // Encrypt the object before sending it
//           alert("Ready for encryption");
//           var message = aesEncrypt_object(userInfo);
//           alert(message);
//           sendRequest('POST', '/register', true, message);
//       }
//       else {
//         alert('Username : ' + validationResult.username);
//         alert('Password : ' + validationResult.password);
//       }
//     }
// }

function sendRequest(method, section, syncValue, data){
    var q = new XMLHttpRequest();
    q.onreadystatechange = receive;
    q.open(method, section, syncValue);
    q.send(data);
    function receive(){
        if (this.readyState == 4 && this.status == 200) {
            //var response = JSON.parse(this.responseText);
            //do something with response
            location.reload();
        }
    }
}

function aesEncrypt_object(object){
  return CryptoJS.AES.encrypt(JSON.stringify(object), 'secret key 123');
}

// Animation
$('.message a').click(function(){
    $('form').animate({height: "toggle", opacity: "toggle"}, "slow");
});
