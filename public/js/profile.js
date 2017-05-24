'use strict';

var password_show_button = document.getElementById('password_show_button');

var profile_username = document.getElementById('profile_username');
var profile_password = document.getElementById('profile_password');
var profile_email = document.getElementById('profile_email');

password_show_button.addEventListener("mousedown", showPassword);
password_show_button.addEventListener("mouseup", hidePassword);

function showPassword(){
    profile_password.setAttribute('type', 'text');
}

function hidePassword(){
    profile_password.setAttribute('type', 'password');
}

function validateUpdate(){
    if (userNameValidation(profile_username.value) != 0) {
      return false;
    }
    else if (passwordValidation(profile_password.value) != 0) {
      return false;
    }
    else if (!validator.isEmail(profile_email)) {
      return false;
    }
    else {
      return true;
    }
}
