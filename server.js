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
var https = require('https');
var path = require("path");
var sql = require("sqlite3").verbose();
var dbpath = path.resolve('public/db/', 'site.db');
console.log(dbpath);
var db = new sql.Database(dbpath);

var httpsOptions = {
  key: fs.readFileSync('https/private.key'),
  cert: fs.readFileSync('https/certificate.pem')
};

var httpsPort = 8000;
var httpPort = 8080;

var httpsServer = https.createServer(httpsOptions, app).listen(httpsPort);
var httpServer = http.createServer(app).listen(httpPort);

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

// app.listen(8080, "localhost");
// console.log("Visit http://localhost:8080/");
// set the view engine to ejs
app.set('view engine', 'ejs');
app.set('port_https', 8000);

app.all('*', function(req,res,next){
  if (req.secure) {
    return next();
  }
  res.redirect('https://' + req.hostname + ":" + app.get('port_https') + req.url);
});
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
  'Crypto' : 1,
  'Machine Intelligence' : 2,
  'Algorithms' : 3,
  'Enterprise' : 4,
  'Research' : 5,
  'Others' : 6
};

function createPost(post, tableRow) {
    post['id'] = tableRow.postID;
    post['title'] = tableRow.title;
    post['description'] = tableRow.introduction;
    post['imageUrl'] = tableRow.imagePath;
    post['categoryId'] = tableRow.category;
    post['categoryName'] = categoriesNames[tableRow.category];
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
      var noOfPosts = 0;
      db.all('select * from posts order by postID desc', handler);

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
                          noOfPosts++;
                      } else {
                          break;
                      }
                  }
              }
              categoriesPosts.push(posts);
          }
          getUserImg(categoriesPosts, noOfPosts);
      }

    function getUserImg(categoriesPosts, noOfPosts) {
        var callbackCount = 0;

        for(let category = 0; category < categoriesPosts.length; category++) {
            for(let post = 0; post < categoriesPosts[category].length; post++) {
                db.each('select * from user where userID= ?', categoriesPosts[category][post].userId, handler);

                function handler(err, row) {
                    if(err) throw err;
                    categoriesPosts[category][post].userImgPath = row.imgURL;
                    categoriesPosts[category][post].userName = row.username;
                    callbackCount++;
                    console.log("session image path: " + sess.imageUrl);
                    if(callbackCount == noOfPosts) {
                        res.render('pages/index', {
                            categoriesPosts: categoriesPosts,
                            session: sess
                        });
                    }
                }
            }
        }
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

        getUserData(posts, posts.length);
    }

    function getUserData(posts, noOfPosts) {
        var callbackCount = 0;

        for(let post = 0; post < posts.length; post++) {
            db.each('select * from user where userID= ?', posts[post].userId, handler);

            function handler(err, row) {
                if(err) throw err;
                posts[post].userName = row.username;
                posts[post].userImgPath = row.imgURL;
                callbackCount++;
                if(callbackCount == noOfPosts) {
                    res.render('pages/category', {
                        posts: posts,
                        session: sess,
                        categoryId: categoryId
                    });
                }
            }
        }
    }
});

app.get('/edit_post.html', function(req, res) {
    var sess = req.session;
    res.render('pages/edit_post',{
        session: sess
    });
});

app.get('/profile.html', function(req, res) {
  var sess = req.session;
  res.render('pages/profile', {
    session: sess
  });
});

app.get('/read_post.html/id=:id', function(req, res) {
    var content = {};
    var postId = req.params.id;
    var sess = req.session;

    db.get('select * from posts where postId= ?', postId, handler);

    function handler(err, row) {
        content['postId'] = postId;
        content['title'] = row.title;
        content['imagePath'] = row.imagePath;
        content['intro'] = row.introduction;
        content['textContent'] = row.content;
        content['userId'] = row.userID;

        getUserData(content);
    }

    function getUserData(content) {
        db.each('select * from user where userID= ?', content.userId, handler);

        function handler(err, row) {
            if(err) throw err;
            content['userName'] = row.username;
            content['userImgPath'] = row.imgURL;
            res.render('pages/read_post', {
                content: content,
                session: sess
            });
        }
    }
});

app.get('/my_stories.html/userId=:id', function(req, res){
    var posts = [];
    var sess = req.session;
    var userId = req.params.id;
    var categoryId = 0;

    db.all('select * from posts where userId= ?', userId, handler);

    function handler(err, table) {
        if (err) throw err;
        for(var row = 0; row < table.length; row++) {
           var post = {};
           createPost(post, table[row]);
           posts.push(post);
       }
       getUserData(posts, posts.length);
   }

    function getUserData(posts, noOfPosts) {
        var callbackCount = 0;

        for(let post = 0; post < posts.length; post++) {
            db.each('select * from user where userID= ?', posts[post].userId, handler);

            function handler(err, row) {
                if(err) throw err;
                posts[post].userName = row.username;
                posts[post].userImgPath = row.imgURL;
                callbackCount++;
                if(callbackCount == noOfPosts) {
                    res.render('pages/category', {
                        posts: posts,
                        session: sess,
                        categoryId: categoryId
                    });
                }
            }
        }
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
                sess.loggedIn = true;
                sess.userName = body.username;
                sess.userId = row.userID;
                sess.imageUrl = row.imgURL;
                sess.userEmail = row.emailAddress;
                sess.password = row.password;
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

function registerRequestHandler(req, res){
  var sess = req.session;

  console.log(req.body);
  console.log(req.files);
  console.log("Request Received");
  var body = req.body;

  db.get("select * from user where username= ?", body.username, handler);
  function handler(err, row) {
    if (err) throw err;
    if (row === undefined) {
      var imagePath = "/img/default.png";
      if (!isEmpty(req.files)) {
         var imageExtension = getExtension(req.files.headImage.name);
        req.files.headImage.name = req.body.username.toLowerCase() + imageExtension;
        console.log("Modified Image File Name", req.files.headImage.name);
        imagePath = "/img/" + req.files.headImage.name;
        req.files.headImage.mv("public" + imagePath, fileMove);
        function fileMove(err){
          if (err) throw err;
        }
      }

      // Insert into the database
      db.run("insert into user (username, password, imgURL, emailAddress) values (?, ?, ?, ?)", [body.username, body.password, imagePath, body.Email.toLowerCase()], insertHandler);

      function insertHandler(err){
        if (err) throw err;
      }

      sess.userName = body.username;
      //sess.loggedIn = true;
      sess.userEmail = body.Email.toLowerCase();
      sess.imageUrl = imagePath;
      sess.password = body.password;
      res.redirect('/index.html');
    }
    else {
      res.send("Username Already in Use");
    }
  }
}


app.get('/logout', logoutHandler);

function logoutHandler(req, res){
  console.log("Logout Request Received");
  var sess = req.session;
  var response = {};
  sess.userName = "";
  sess.imageUrl = "";
  sess.userEmail = "";
  sess.password = "";
  sess.loggedIn = false;
  //response.logoutResponse = "Logged Out Already";
  //res.send(JSON.stringify(response));
  res.redirect("/index.html");
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
  if (!isEmpty(req.files)){
    console.log("There is an Image");
    var imageExtension = getExtension(req.files.Image.name);
    var validTitle = validateName(body.Title);
    req.files.Image.name = userName.toLowerCase() + '_' + body.Title + '_' + Date.now() + imageExtension;
    console.log("Modified Image File Name", req.files.Image.name);
    imagePath = "/img/" + req.files.Image.name;
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

app.post('/updateProfile', profileUpdateHandler);

function profileUpdateHandler(req,res){
  console.log(req.body);
  var sess = req.session;
  var originalUserName = sess.userName;

  if (isEmpty(req.files)) {
    console.log("No uploaded files");
    db.each("select * from user where username = ?", originalUserName, withoutImage);
    function withoutImage(err, row){
      if (err) throw err;
      if (row != undefined){
        db.run("update user set username = ?, password = ?, emailAddress = ? where userID = ?", [req.body.username_profile, req.body.password_profile, req.body.email_profile, row.userID], updateHandler);

        function updateHandler(err, row){
          if (err) throw err;
          sess.userName = req.body.username_profile;
          sess.userEmail = req.body.email_profile;
          sess.userPassword = req.body.password_profile;
          console.log('Updated');
          res.redirect('index.html');
        }
      }
    }
  }
  else { // The case where the header image changed
    console.log("There is a new header image file");
    db.each("select * from user where username = ?", originalUserName, withImage);
    function withImage(err, row){
      if (err) throw err;
      if (row != undefined) {
        var imagePath = 'public' + row.imgURL;
        var imageExtension = getExtension(req.files.image_profile.name);
        req.files.image_profile.name = req.body.username_profile.toLowerCase() + imageExtension;
        var newImgPath = '/img/' + req.files.image_profile.name;
        fs.unlink(imagePath, unlinkHander);

        function unlinkHander(err) {
          if (err) throw err;
          console.log("unlinked original File");
          req.files.image_profile.mv('public' + newImgPath, afterSaveImage);

          function afterSaveImage(err){
            db.run("update user set username = ?, password = ?, emailAddress = ? , imgURL = ? where userID = ?", [req.body.username_profile, req.body.password_profile, req.body.email_profile, newImgPath, row.userID], updateHandler);

            function updateHandler(err, row){
              if (err) throw err;
              sess.userName = req.body.username_profile;
              sess.userEmail = req.body.email_profile;
              sess.userPassword = req.body.password_profile;
              sess.imageUrl = newImgPath;
              console.log('Updated');
              res.redirect('index.html');
            }
          }
        }
      }
    }
    // req.files.profile_image.name = req.body.username.toLowerCase() + '_header.png';
    // console.log("Modified Image File Name", req.files.headImage.name);
    // imagePath = "/img/" + req.files.headImage.name;
  }
  console.log(req.files);
  console.log("Request Received");
  //res.redirect('index.html');
}

function validateName(fileName) {
    var validName = fileName.replace(' ', '_');
    return validName;
}

function getExtension(fileName) {
    var index = fileName.indexOf('.');
    var extension = fileName.substring(index, fileName.length);

    return extension;
}

function isEmpty(obj) {

    // null and undefined are "empty"
    if (obj == null) return true;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // If it isn't an object at this point
    // it is empty, but it can't be anything *but* empty
    // Is it empty?  Depends on your application.
    if (typeof obj !== "object") return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
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
