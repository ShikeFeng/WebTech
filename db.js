"use strict"
var path = require("path");
var sql = require("sqlite3").verbose();
var dbpath = path.resolve('public/db/', 'site.db');
console.log(dbpath);
var db = new sql.Database(dbpath);

login(["Brilliantdsds", "Hello123"]);



// This is the function to register users to the website
// userInfo should be an array containing the user's information
function register(userInfo){
   db.run("insert into user values (?, ?)", userInfo, handler);
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
function login(loginInfo){
    db.get("select * from user where username= ?", loginInfo[0], handler);
    function handler(err, row) {
        if (err) {
            throw err;
        }
        else {
            if (row === undefined){
                console.log("No Such User");
            }
            else {
                if(row.password === loginInfo[1]){
                    console.log("Correct Username and Password");
                }
                else {
                    console.log("Password Incorrect");
                }
            }

        }
    }
}
