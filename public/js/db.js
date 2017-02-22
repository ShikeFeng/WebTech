"use strict"
var path = require("path");
var sql = require("sqlite3");
console.log(sql);
var dbpath = path.resolve('public/db/', 'site.db');
console.log(dbpath);
var db = new sql.Database(dbpath);

var all = db.all("select * from user", show);

function show(err, rows) {
    if (err) throw err;
    console.log(rows);
}

console.log(all);