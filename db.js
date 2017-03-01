"use strict"
var path = require("path");
var sql = require("sqlite3").verbose();
var dbpath = path.resolve('public/db/', 'site.db');
console.log(dbpath);
var db = new sql.Database(dbpath);


// This is the function to register users to the website
// userInfo should be an array containing the user's information
function register(data){
   db.run("insert into user values (?, ?)", [data.username, data.password], handler);
   function handler(err, rows){
       if (err) {
           console.log("Username Already Exist");
       }
       else {
           console.log("Successfully Registered");
       }
   }
}

// This is the function to handle user's login
// loginInfo should be an array of the form [username, password]
function login(data){
    var response;
    db.get("select * from user where username= ?", data.username, handler);
    function handler(err, row) {
        if (err) {
            throw err;
        }
        else {
            if (row === undefined){
                return 1;
            }
            else {
                if(row.password === data.password){
                    return 0;
                    console.log("Correct Username and Password");
                }
                else {
                    return 2;
                    console.log("Password Incorrect");
                }
            }
        }
    }
}


module.exports = {
    register: register,
    login: login,
};
