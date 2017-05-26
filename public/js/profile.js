'use strict';

var password_show_button = document.getElementById('password_show_button');

var profile_username = document.getElementById('profile_username');
var profile_password = document.getElementById('profile_password');
var profile_email = document.getElementById('profile_email');

var validationMessage_username = document.getElementById('validationMessage_username');
var validationMessage_password = document.getElementById('validationMessage_password');
var validationMessage_email = document.getElementById('validationMessage_email');

password_show_button.addEventListener("mousedown", showPassword);
password_show_button.addEventListener("mouseup", hidePassword);


profile_username.addEventListener('keyup', username_validation);
profile_password.addEventListener('keyup', password_validation);
profile_email.addEventListener('keyup', email_validation);

function showPassword(){
    profile_password.setAttribute('type', 'text');
}

function hidePassword(){
    profile_password.setAttribute('type', 'password');
}

function validateUpdate(){
    if (userNameValidation(profile_username.value) === 0 && passwordValidation(profile_password.value) === 0 && validator.isEmail(profile_email.value)) {
      return true;
    }

    return false;
}

function username_validation(){
  switch (userNameValidation(profile_username.value)) {
    case 1:
      validationMessage_username.innerHTML = "Length is Less Than 6";
      validationMessage_username.style.color = "red";
      break;
    case 2:
      validationMessage_username.innerHTML = "Length is Greater Than 12";
      validationMessage_username.style.color = "red";
      break;
    case 3:
      validationMessage_username.innerHTML = "Non-alphanumeric Characters Exist";
      validationMessage_username.style.color = "red";
      break;
    default:
      validationMessage_username.innerHTML = "Correct Format";
      validationMessage_username.style.color = "green";
  }
}

function password_validation(){
  switch (passwordValidation(profile_password.value)) {
    case 1:
      validationMessage_password.innerHTML = "Length Less Than 10";
      validationMessage_password.style.color = "red";
      break;
    case 2:
      validationMessage_password.innerHTML = "Non-digits Less Than 2";
      validationMessage_password.style.color = "red";
      break;
    case 3:
      validationMessage_password.innerHTML = "Invalid Characters";
      validationMessage_password.style.color = "red";
      break;
    default:
      validationMessage_password.innerHTML = "Correct Format";
      validationMessage_password.style.color = "green";
      break;
  }
}

function email_validation(){
  if (!validator.isEmail(profile_email.value)){
    validationMessage_email.innerHTML = "Invalid Email Address";
    validationMessage_email.style.color = "red";
  }
  else {
    validationMessage_email.innerHTML = "Correct Format";
    validationMessage_email.style.color = "green";
  }
}
