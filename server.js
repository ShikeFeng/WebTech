"use strict";
// Sample express web server.  Supports the same features as the provided server,
// and demonstrates a big potential security loophole in express.

var express = require("express");
var session = require('express-session');
var fileUpload = require('express-fileupload');
var multer = require('multer');
var upload = multer({dest: 'public/img/'});

var validator = require('validator');
var url_Validator = require('valid-url');
var crypto = require("crypto-js");

var app = express();
var fs = require("fs");
var http = require('http');
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
app.use(fileUpload());
var options = { setHeaders: deliverXHTML };
app.use(express.static("public", options));

// url validation
app.use(urlValidation);
// initialise session
app.use(session({
  secret: 'ssshhhh',
  resave: false,
  saveUninitialized: true,
  cookie: {maxAge: 600000}
}));

app.listen(8080, "localhost");
console.log("Visit http://localhost:8080/");
// set the view engine to ejs
app.set('view engine', 'ejs');

/*Global Variables*/
var categories = [1,2,3];   //Hardcoded for the current category types
var postsPerCategory = [4, 4, 6];    //Hardcoded for the current layout
var categoriesNames = {
    1: 'Crypto',
    2: 'Machine Intelligence',
    3: 'Algorithms',
    4: 'Enterprise',
    5: 'Research',
    6: 'Others'
};

var categoryNumber = {
  'Programming' : 1,
  'Digital Device' : 2,
  'Software' : 3
};

function createPost(post, tableRow) {
    post['id'] = tableRow.postID;
    post['title'] = tableRow.title;
    post['description'] = tableRow.introduction;
    post['imageUrl'] = tableRow.imagePath;
    post['categoryId'] = tableRow.category;
    post['categoryName'] = categoriesNames[tableRow.category];
    post['userName'] = tableRow.userName;
    post['userId'] = tableRow.userID;

    return post;
}

function getFullURL(req){
  return req.protocol + '://' + req.get('host') + req.originalUrl;
}

function urlValidation(req, res, next){
  console.log("Request Type : ", req.method);
  var fullURL = getFullURL(req);
  console.log("Full URL : ", fullURL);
  if (url_Validator.isUri(fullURL)){
    console.log("Valid URL");
    next();
  } else {
    res.send("Invalid URL !");
  }
}


app.get('/index.html', indexHandler);

function indexHandler(req, res) {
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
              categoriesPosts: categoriesPosts,
              session: sess
          });
      }
}

app.get('/category.html/id=:id', function(req, res) {
    var posts = [];
    var categoryId = req.params.id;
    var sess = req.session;

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
            posts: posts,
            session: sess,
            categoryId: categoryId
        });
    }
});

app.get('/edit_post.html', function(req, res) {
    var sess = req.session;
    res.render('pages/edit_post',{
        session: sess
    });
});

app.get('/read_post.html/id=:id', function(req, res) {
    var content = {};
    var postId = req.params.id;
    var sess = req.session;

    db.get('select * from posts where postId= ?', postId, handler);

    function handler(err, row) {
        content['title'] = row.title;
        content['imagePath'] = row.imagePath;
        content['textContent'] = row.content;
        content['userName'] = row.userName

        res.render('pages/read_post', {
            content: content,
            session: sess
        });
    }
});

app.get('/my_stories.html/userName=:name', function(req, res){
    var posts = [];
    var sess = req.session;
    var userName = req.params.name;
    var categoryId = 0;
    userName = userName.charAt(0).toUpperCase() + userName.slice(1);

    db.all('select * from posts where userName= ?', userName, handler);

    function handler(err, table) {
        if (err) throw err;
        for(var row = 0; row < table.length; row++) {
           var post = {};
           createPost(post, table[row]);
           posts.push(post);
       }

       res.render('pages/category', {
           posts: posts,
           session: sess,
           categoryId: categoryId
       });
   }
});

// login
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
        console.log('Undecrypted Message : ', body);
        body = crypto.AES.decrypt(body, 'secret key 123').toString(crypto.enc.Utf8);
        console.log('Decrypted Message : ', body);
    }

    function end(){
        body = JSON.parse(body);
        db.get("select * from user where username= ?", body.username, handler);

        function handler(err, row){
            if (err)  throw err;

            if (row === undefined) {
              response.loginResponse = "No such user";
              sess.loggedIn = false;
              response.loggedIn = false;
            }
            else if(row.password === body.password) {
              response.loginResponse = "Successfully LoggedIn";
              // response.imageIcon = row.imgURL;  -- this is not needed as imageUrl is kept on sess obj
              sess.userName = body.username;
              sess.loggedIn = true;
              sess.imageUrl = row.imgURL;
              response.loggedIn = true;
            }
            else {
              response.loginResponse = "Incorrect Password";
              sess.loggedIn = false;
              response.loggedIn = false;
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
        console.log('Undecrypted Message : ', body);
        body = crypto.AES.decrypt(body, 'secret key 123').toString(crypto.enc.Utf8);
        console.log("Decrypted Message : ", body);
    }

    function end(){
        body = JSON.parse(body);
        db.get("select * from user where username= ?", body.username, handler);

        function handler(err, row) {
          if (err) throw err;
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

app.post('/logout', logoutHandler);

function logoutHandler(req, res){
  console.log("Logout Request Received");
  var sess = req.session;
  var response = {};
  sess.userName = "";
  sess.loggedIn = false;
  response.logoutResponse = "Logged Out Already";
  res.send(JSON.stringify(response));
}


app.post('/writePost', writePostHandler);

function writePostHandler(req, res){
  console.log(req.body);
  console.log(req.files);
  console.log("Request Received");
  //var userName = "Robert";
  var userName = req.session.userName; // get the username of the current user
  // The write post page will only be accessed for users which have already loggedIn

  var body = req.body;
  var imagePath = "/img/default.png";
  console.log(req.files);
  if (!req.files) {
    console.log("There is an Image");
    req.files.Image.name = userName.toLowerCase() + '_' + body.Title + '_' + Date.now() + ".png";
    console.log("Modified Image File Name", req.files.Image.name);
    var imagePath = "/img/" + req.files.Image.name;
    req.files.Image.mv("public" + imagePath, exceptionHandler);
    function exceptionHandler(err){
      console.log("Sth Wrong");
    }
  }

  console.log(req.body.Title);
  db.each("select * from user where username= ?", userName, handler);
  function handler(err,row){
    if (err) throw err;
    // var userID = row.userID;
    // messages.push(userID);
    console.log("userID ", row.userID);
    db.run("insert into posts (title, introduction, content, category, imagePath, userID, userName) values (?, ?, ?, ?, ?, ?, ?)", [body.Title, body.Intro, body.Article, categoryNumber[body.Category], imagePath,row.userID, userName], insertHandler);

    function insertHandler(err, row){
      console.log("Insertion Finished");
      if (err) throw err;
    }
  }
      res.redirect('index.html');
      // res.send("OK");
  // }
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
