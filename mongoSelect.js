var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

const client = MongoClient(url, { useUnifiedTopology: true });

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