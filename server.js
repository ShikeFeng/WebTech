"use strict";
// Sample express web server.  Supports the same features as the provided server,
// and demonstrates a big potential security loophole in express.

var express = require("express");
var app = express();
var fs = require("fs");
var path = require("path");
var sql = require("sqlite3").verbose();
var dbpath = path.resolve('public/db/', 'site.db');
console.log(dbpath);
var db = new sql.Database(dbpath);

var banned = [];
banUpperCase("./public/", "");

// Define the sequence of functions to be called for each request.  Make URLs
// lower case, ban upper case filenames, require authorisation for admin.html,
// and deliver static files from ./public.
app.use(lower);
app.use(ban)
app.use("/admin.html", auth);
var options = { setHeaders: deliverXHTML };
app.use(express.static("public", options));
app.listen(8080, "localhost");
console.log("Visit http://localhost:8080/");

// set the view engine to ejs
app.set('view engine', 'ejs');

app.get('/index.html', function(req, res) {
    var posts = [];
    var post1 = {};
    var post2 = {};

    post1['title'] = 'HOW TO KEEP CALM AND LOVE PROGRAMMING?';
    post1['description'] = 'just try to enjoy it ^_^';
    post1['imageUrl'] = '/img/shikefeng.jpg';
    post1['userName'] = 'Brilliant Robert';

    post2['title'] = 'Java or C++ ? Which one is better ?';
    post2['description'] = 'Both are very popular, whether one is better than the other depends on ...';
    post2['imageUrl'] = '/img/shikefeng.jpg';
    post2['userName'] = 'Brilliant Robert';

    posts.push(post1);
    posts.push(post2);

    res.render('pages/index', {
        posts: posts
    });
});

app.get('/category.html', function(req, res) {
    res.render('pages/category');
});

app.get('/edit_post.html', function(req, res) {
    res.render('pages/edit_post');
});

app.get('/read_post.html', function(req, res) {
    res.render('pages/read_post');
});

// login / register
app.post('/login', loginRequestHandler);
function loginRequestHandler(req, res) {
    var body = "";
    req.on('data', add);
    req.on('end', end);
    var response = {};
    function add(chunk){
        body = body + chunk.toString();
    }

    function end(){
        body = JSON.parse(body);

        db.get("select * from user where username= ?", body.userName, handler);

        function handler(err, row){
            if (err) {
                throw err;
            }
            else {
                if (row === undefined){
                    response.loginResponse = "No such user";
                }
                else {
                    if(row.password === body.password){
                        response.loginResponse = "Successfully LoggedIn";
                    }
                    else {
                        response.loginResponse = "Incorrect Password";
                    }
                }
                res.send(JSON.stringify(response));
            }
        }

    }
}


// Make the URL lower case.
function lower(req, res, next) {
    req.url = req.url.toLowerCase();
    next();
}

// Forbid access to the URLs in the banned list.
function ban(req, res, next) {
    for (var i=0; i<banned.length; i++) {
        var b = banned[i];
        if (req.url.startsWith(b)) {
            res.status(404).send("Filename not lower case");
            return;
        }
    }
    next();
}

// Redirect the browser to the login page.
function auth(req, res, next) {
    res.redirect("/login.html");
}

// Called by express.static.  Deliver response as XHTML.
function deliverXHTML(res, path, stat) {
    if (path.endsWith(".ejs")) {
        res.header("Content-Type", "application/xhtml+xml");
    }
}

// Check a folder for files/subfolders with non-lowercase names.  Add them to
// the banned list so they don't get delivered, making the site case sensitive,
// so that it can be moved from Windows to Linux, for example. Synchronous I/O
// is used because this function is only called during startup.  This avoids
// expensive file system operations during normal execution.  A file with a
// non-lowercase name added while the server is running will get delivered, but
// it will be detected and banned when the server is next restarted.
function banUpperCase(root, folder) {
    var folderBit = 1 << 14;
    var names = fs.readdirSync(root + folder);
    for (var i=0; i<names.length; i++) {
        var name = names[i];
        var file = folder + "/" + name;
        if (name != name.toLowerCase()) banned.push(file.toLowerCase());
        var mode = fs.statSync(root + file).mode;
        if ((mode & folderBit) == 0) continue;
        banUpperCase(root, file);
    }
}

function generatePosts() {
    /*insert database query here*/
    /*create array of posts here*/
}