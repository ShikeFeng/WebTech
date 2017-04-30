"use strict"

function userInfoValidation(userInfo){
    var validation = {};
    var userNameValidate = userNameValidation(userInfo.username);
    var passwordValidate = passwordValidation(userInfo.password);
    switch (userNameValidate) {
        case 1:
            validation.username = "Username should be no less than 6 characters";
            break;
        case 2:
            validation.username = "Username should be no longer than 12 characters";
            break;
        case 3:
            validation.username = "Username should start with a letter";
            break;
        default:
            validation.username = "valid";
            break;
    }
    switch (passwordValidate) {
        case 1:
            validation.password = "Password length should be greater than 12";
            break;
        case 2:
            validation.password = "Password should contain at least 3 non-digits";
            break;
        case 3:
            validation.password = "Password should not contain non-alphanumeric characters";
            break;
        default:
            validation.password = "valid";
            break;
    }
    return validation;
}

function passwordValidation(password){
    //check the length of the password
    if (password.length < 10) {
        return 1;
    }
    //check the number of non-digits in the password
    else if (password.length - password.replace(/\D/g, '').length < 3) {
        return 2;
    }
    //password should not contain invalid characters
    else if (password.length != password.replace(/[^0-9a-zA-Z]/g, '').length ) {
        return 3
    }
    else {
        return 0;
    }
}

function userNameValidation(username){
    if (username.length < 6){
        return 1;
    }
    else if (username.length > 12){
        return 2;
    }
    else if (!username[0].match(/^[A-Za-z]+$/)){
        return 3;
    }
    else {
        return 0
    }
}
