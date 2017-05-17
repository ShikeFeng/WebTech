'use strict'
var userInfo = document.getElementById('UserInfo');
var logoutButton = document.getElementById('logout');

userInfo.onclick = function() {
  document.getElementById("myDropdown").classList.toggle("show");
}

logoutButton.onclick = function() {
  sendRequest('POST', '/logout', true, null);
}
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {

    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}
