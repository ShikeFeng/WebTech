"use strict";
// Sample express web server.  Supports the same features as the provided server,
// and demonstrates a big potential security loophole in express.

var express = require("express");
var session = require('express-session');
var validator = require('validator');
var url_Validator = require('valid-url');

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

// initialise session
app.use(session({
  secret: 'ssshhhh',
  resave: false,
  saveUninitialized: true,
  cookie: {maxAge: 60000}
}));

app.listen(8080, "localhost");
console.log("Visit http://localhost:8080/");
// set the view engine to ejs
app.set('view engine', 'ejs');

/*Global Variables*/
var categories = [1,2,3];   //Hardcoded for the current category types
var postsPerCategory = [4, 4, 6];    //Hardcoded for the current layout
var categoriesNames = {
    1: 'Programming',
    2: 'Digital Device',
    3: 'Software'
};

function createPost(post, tableRow) {
    post['id'] = tableRow.postID;
    post['title'] = tableRow.title;
    post['description'] = tableRow.introduction;
    post['imageUrl'] = tableRow.imagePath;
    post['categoryId'] = tableRow.category;
    post['categoryName'] = categoriesNames[tableRow.category];

    return post;
}

function getFullURL(req){
  return req.protocol + '://' + req.get('host') + req.originalUrl;
}

function urlValidation(req, res, next){
  onsole.log("Request Type : ", req.method);
  var fullURL = getFullURL(req);
  console.log("Full URL : ", fullURL);
  if (url_Validator.isUri(fullURL)){
    console.log("Valid URL");
    next();
  } else {
    res.send("Invalid URL !");
  }
}


app.get('/index.html', function(req, res) {
      var sess = req.session;
      console.log("rep.session.id -> " + sess.id);
      console.log("req.sessionID -> " + req.sessionID);
      if (sess.loggedIn){
        console.log("Already loggedIn");
        console.log("Username -> " + sess.userName);
      }
      else {
        console.log("haven't logged yet");
      }
      var categoriesPosts = [];

      db.all('select * from posts order by postID desc', handler);

      //db.all("select * from posts where category = '1'", handler);

      function handler(err, table) {
          if (err) throw err;
          for(var categoryId = 1; categoryId<=categories.length; categoryId++) {
              var posts = [];
              for(var row = 0; row < table.length; row++) {
                  var post = {};
                  if(table[row].category == categoryId) {
                      createPost(post, table[row]);
                      if(posts.length < postsPerCategory[categoryId - 1]) {
                          posts.push(post);
                      } else {
                          break;
                      }
                  }
              }
              categoriesPosts.push(posts)
          }
          res.render('pages/index', {
              categoriesPosts: categoriesPosts
          });
      }
});

app.get('/category.html/id=:id', function(req, res) {
    var posts = [];
    var categoryId = req.params.id;

    db.all('select * from posts order by postID desc', handler);

    function handler(err, table) {
        if (err) throw err;
        for(var row = 0; row < table.length; row++) {
            var post = {};
            createPost(post, table[row]);
            if(categoryId == post['categoryId']) {
                posts.push(post);
            }
        }
        res.render('pages/category', {
            posts: posts
        });
    }
});

app.get('/edit_post.html', function(req, res) {
    res.render('pages/edit_post');
});

app.get('/read_post.html/id=:id', function(req, res) {
    var content = {};
    var postId = req.params.id;

    db.get('select * from posts where postId= ?', postId, handler);

    function handler(err, row)
    {
        content['title'] = row.title;
        content['imagePath'] = row.imagePath;
        content['textContent'] = row.content;

        res.render('pages/read_post', {
            content: content
        });
    }
});

// login / register
app.post('/login', loginRequestHandler);
function loginRequestHandler(req, res) {
    console.log("request received");
    var sess = req.session;
    console.log("Session ID -> " + sess.genid);

    if (sess.loggedIn) {
      console.log("Already loggedIn, Username -> " + sess.userName);
    }
    else {
      console.log("Haven't loggedIn Yet");
    }
    var body = "";
    req.on('data', add);
    req.on('end', end);
    var response = {};
    function add(chunk){
        body = body + chunk.toString();
        console.log(body);
    }

    function end(){
        body = JSON.parse(body);

        db.get("select * from user where username= ?", body.username, handler);

        function handler(err, row){
            if (err)  throw err;

            if (row === undefined) {
              response.loginResponse = "No such user";
              sess.loggedIn = false;
            }
            else if(row.password === body.password) {
              response.loginResponse = "Successfully LoggedIn";
              response.imageIcon = row.imgURL;
              sess.userName = body.username;
              sess.loggedIn = true;
            }
            else {
              response.loginResponse = "Incorrect Password";
              sess.loggedIn = false;
            }
            res.send(JSON.stringify(response));
        }
    }
}


// register
app.post('/register', registerRequestHandler);
function registerRequestHandler(req, res) {
    var sess = req.session;
    var body = "";
    console.log("Register Request Received");
    req.on('data', add);
    req.on('end', end);
    var response = {};
    function add(chunk){
        body = body + chunk.toString();
    }

    function end(){
        body = JSON.parse(body);
        console.log(body);
        db.get("select * from user where username= ?", body.userName, handler);

        function handler(err, row) {
          if (err) throw err;
          console.log(row);
          if (row === undefined) {
            db.run("insert into user (username, password) values (?, ?)", [body.username, body.password], insertHandler);

            function insertHandler(err){
              if (err) throw err;
            }
            sess.userName = body.username;
            sess.loggedIn = true;
            response.registerResponse = "Successfully Registered";
          }
          else {
            response.registerResponse = "Username Already Used";
            sess.loggedIn = false;
          }
          res.send(JSON.stringify(response));
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
