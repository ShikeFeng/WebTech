'use strict'
var userInfo = document.getElementById('UserInfo');

if(userInfo != null){
    userInfo.onclick = function() {
        document.getElementById("myDropdown").classList.toggle("show");
    }
}

document.onclick = function(event) {
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
