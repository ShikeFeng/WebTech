'use strict'
var userInfo = document.getElementById('UserInfo');
var logoutButton = document.getElementById('logout');

if(userInfo){
    userInfo.onclick = function() {
        document.getElementById("myDropdown").classList.toggle("show");
    }
}

if(logoutButton){
    logoutButton.onclick = function() {
        sendRequest('POST', '/logout', true, null);
    }
}

document.onclick = function(event) {
    if (!event.target.matches('.dropbtn')) {

        var dropdowns = document.getElementsByClassName("dropdown-content");
        if (!event.target.matches('.dropbtn')) {
            for (var i = 0; i < dropdowns.length; i++) {
                var openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    }
}
