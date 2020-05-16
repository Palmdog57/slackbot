/** 
 * Import required libraries and initialize connection to Mongo
 */
require('dotenv').config();
var MongoClient = require('mongodb').MongoClient;
const urlConstructor = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@localhost:27017/slackbot`

const client = MongoClient(urlConstructor, { useUnifiedTopology: true });

client.connect(function(err, db) {
  if (err) throw err;
  var dbo = db.db("slackbot");
  dbo.collection("commands").find({"cmd_name":'cat'}).toArray(function(err, result) {
    if (err) throw err;
    console.log(typeof(result));
    console.log(result[0].cmd_desc);
    db.close();
  });
});


//dbo.collection("bookstore").find({"name":'Sex for dummies'}).toArray(function(err, result) {