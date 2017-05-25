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

var helmet = require('helmet');
var sql = require("sqlite3").verbose();
var dbpath = path.resolve('public/db/', 'site.db');
var db = new sql.Database(dbpath);

var httpsOptions = {
  key: fs.readFileSync('https/private.key'),
  cert: fs.readFileSync('https/certificate.pem')
};

var httpsPort = 8000;
var httpPort = 8080;

var httpsServer = https.createServer(httpsOptions, app).listen(httpsPort);
var httpServer = http.createServer(app).listen(httpPort);

/*Global Variables*/
var categories = [1,2,3, 4, 5, 6];   //Hardcoded for the current category types
var postsPerCategory = [4, 4, 6, 4, 4, 6];    //Hardcoded for the current layout
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

app.use(helmet()); // url validation
app.use(urlValidation); // initialise session and set cookie secure options
app.use(session({
  secret: 'ssshhhh',
  name: 'ourSession',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 600000,
    secure: true,
    httpOnly: true,
  }
}));

console.log("Please Visit http://localhost:8080/ or https://localhost:8000/");
app.set('view engine', 'ejs');  // set the view engine to ejs
app.set('port_https', 8000);
app.all('*', function(req,res,next){
  if (req.secure) {
    return next();
  }
  res.redirect('https://' + req.hostname + ":" + app.get('port_https') + req.url);
});



app.get('/', redirectHandler);
app.get('/index.html', indexHandler);
app.get('/logout', logoutHandler);
app.get('/edit_post.html', editPostHandler);
app.get('/profile.html', getProfileHandler);
app.get('/read_post.html/id=:id', readPostHandler);
app.get('/my_stories.html/userId=:id', getMyStoriesHandler);
app.get('/category.html/id=:id', categoryHandler);


app.post('/login', loginRequestHandler);
app.post('/register', registerRequestHandler)
app.post('/writePost', writePostHandler);
app.post('/updateProfile', profileUpdateHandler);


// Callback Handlers

function redirectHandler(req, res){
  res.redirect('/index.html');
}

// login
function loginRequestHandler(req, res) {
    var sess = req.session;
    var body = "";
    req.on('data', add);
    req.on('end', end);
    var response = {};
    function add(chunk){
        body = body + chunk.toString();
        body = crypto.AES.decrypt(body, 'secret key 123').toString(crypto.enc.Utf8);
    }

    function end(){
        body = JSON.parse(body);
        var ps = db.prepare("select * from user where username= ?");
        ps.get(body.username, handler);
        //db.get("select * from user where username= ?", body.username, handler);

        function handler(err, row){
            if (err)  throw err;

            if (row === undefined) {
              response.loginResponse = "No Such User";
              sess.loggedIn = false;
              response.loggedIn = false;
            }
            else if(row.password === body.password) {
                response.loginResponse = "Successfully LoggedIn";

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
function registerRequestHandler(req, res){
  var sess = req.session;
  var body = req.body;
  var ps = db.prepare("select * from user where username= ?")
  ps.get(body.username, handler);
  function handler(err, row) {
    if (err) throw err;
    if (row === undefined) {
      var imagePath = "/svg/default.svg";
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
      var pr = db.prepare("insert into user (username, password, imgURL, emailAddress) values (?, ?, ?, ?)");
      pr.run([body.username, body.password, imagePath, body.Email.toLowerCase()], insertHandler);

      function insertHandler(err){
        if (err) throw err;
        sess.userName = body.username;
        sess.loggedIn = true;
        sess.userEmail = body.Email.toLowerCase();
        sess.imageUrl = imagePath;
        sess.password = body.password;
        var pr1 = db.prepare("select * from user where username= ?");
        pr1.get(body.username, handler1);
        function handler1(err, row2){
          if (err) throw err;
          sess.userId = row2.userID;
          console.log(row2.userID);
          res.redirect('/index.html');

        }
      }


    }
    else {
      res.send("Username Already in Use");
    }
  }
}


// logout
function logoutHandler(req, res){
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


// Write post
function writePostHandler(req, res){

  if (req.session.loggedIn === false){
    res.send("Session Expired, Please Login Again");
  }

  else {
    var userName = req.session.userName; // get the username of the current user
    // The write post page will only be accessed for users which have already loggedIn
    var body = req.body;
    var imagePath = "/svg/default.svg";
    if (!isEmpty(req.files)){
      var imageExtension = getExtension(req.files.Image.name);
      var validTitle = validateName(body.Title);
      req.files.Image.name = userName.toLowerCase() + '_' + body.Title.toLowerCase() + '_' + Date.now() + imageExtension;
      imagePath = "/img/" + req.files.Image.name;
      req.files.Image.mv("public" + imagePath, exceptionHandler);
      function exceptionHandler(err){
        if (err) throw err;
        console.log("File Uploaded");
      }
    }

    var ps = db.prepare("select * from user where username= ?");
    ps.each(userName, handler);
    function handler(err,row){
      if (err) throw err;
      // var userID = row.userID;
      // messages.push(userID);
      var pr = db.prepare("insert into posts (title, introduction, content, category, imagePath, userID, userName) values (?, ?, ?, ?, ?, ?, ?)");
      pr.run([body.Title, body.Intro, body.Article, categoryNumber[body.Category], imagePath,row.userID, userName], insertHandler);

      function insertHandler(err, row){
        if (err) throw err;
      }
    }
        res.redirect('index.html');
        // res.send("OK");
    // }
  }

}

// Update profile
function profileUpdateHandler(req,res){
  var sess = req.session;
  var originalUserName = sess.userName;

  if (isEmpty(req.files)) {
    var ps = db.prepare("select * from user where username = ?");
    ps.each(originalUserName, withoutImage);
    function withoutImage(err, row){
      if (err) throw err;
      if (row != undefined){
        var pr = db.prepare("update user set username = ?, password = ?, emailAddress = ? where userID = ?");
        pr.run([req.body.username_profile, req.body.password_profile, req.body.email_profile, row.userID], updateHandler);

        function updateHandler(err, row){
          if (err) throw err;
          sess.userName = req.body.username_profile;
          sess.userEmail = req.body.email_profile;
          sess.userPassword = req.body.password_profile;
          res.redirect('index.html');
        }
      }
    }
  }
  else { // The case where the header image changed
    var ps = db.prepare("select * from user where username = ?");
    ps.each(originalUserName, withImage);
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
          req.files.image_profile.mv('public' + newImgPath, afterSaveImage);

          function afterSaveImage(err){
            var pr = db.prepare("update user set username = ?, password = ?, emailAddress = ? , imgURL = ? where userID = ?");
            pr.run([req.body.username_profile, req.body.password_profile, req.body.email_profile, newImgPath, row.userID], updateHandler);

            function updateHandler(err, row){
              if (err) throw err;
              sess.userName = req.body.username_profile;
              sess.userEmail = req.body.email_profile;
              sess.userPassword = req.body.password_profile;
              sess.imageUrl = newImgPath;
              res.redirect('index.html');
            }
          }
        }
      }
    }
  }
  //res.redirect('index.html');
}

function indexHandler(req, res) {
      var sess = req.session;

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

function categoryHandler(req, res){
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
                  getMostRecentStories();
              }
          }
      }
  }

  function getMostRecentStories() {
      var recentPosts = [];

      db.all('select * from posts order by postID desc', handleRecentStories);

      function handleRecentStories(err, rows) {
          if(err) throw err;
          for(var row = 0; row < 5; row++) {
              var post = {};
              createPost(post, rows[row]);
              recentPosts.push(post);
          }
          getUserIcons();
      }

      function getUserIcons() {
          var callbackCount = 0;
          for(let post = 0; post < recentPosts.length; post++) {
              db.each('select * from user where userID= ?', recentPosts[post].userId, handleUserIcon);

              function handleUserIcon(err, row){
                  if(err) throw err;
                  recentPosts[post].userImgPath = row.imgURL;
                  recentPosts[post].userName = row.username;
                  callbackCount++;
                  if(callbackCount == recentPosts.length) {
                      res.render('pages/category', {
                          posts: posts,
                          recentPosts: recentPosts,
                          session: sess,
                          categoryId: categoryId
                      });
                  }
              }
          }
      }
  }
}

function editPostHandler(req, res){
  var sess = req.session;
  res.render('pages/edit_post',{
      session: sess
  });
}

function getProfileHandler(req, res){
  var sess = req.session;
  res.render('pages/profile', {
    session: sess
  });
}

function readPostHandler(req, res){
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
}

function getMyStoriesHandler(req, res){
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
                  getMostRecentStories();
              }
          }
      }
  }

  function getMostRecentStories() {
      var recentPosts = [];

      db.all('select * from posts order by postID desc', handleRecentStories);

      function handleRecentStories(err, rows) {
          if(err) throw err;
          for(var row = 0; row < 5; row++) {
              var post = {};
              createPost(post, rows[row]);
              recentPosts.push(post);
          }
          getUserIcons();
      }

      function getUserIcons() {
          var callbackCount = 0;
          for(let post = 0; post < recentPosts.length; post++) {
              db.each('select * from user where userID= ?', recentPosts[post].userId, handleUserIcon);

              function handleUserIcon(err, row){
                  if(err) throw err;
                  recentPosts[post].userImgPath = row.imgURL;
                  recentPosts[post].userName = row.username;
                  callbackCount++;
                  if(callbackCount == recentPosts.length) {
                      res.render('pages/category', {
                          posts: posts,
                          recentPosts: recentPosts,
                          session: sess,
                          categoryId: categoryId
                      });
                  }
              }
          }
      }
  }
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
    var fullURL = getFullURL(req);
    if (url_Validator.isUri(fullURL)){
        next();
    } else {
        res.send("Invalid URL !");
    }
}

// Check if an object is empty or not
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
