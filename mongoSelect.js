var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

const client = MongoClient(url, { useUnifiedTopology: true });

client.connect(function(err, db) {
  if (err) throw err;
  var dbo = db.db("hooli");
  dbo.collection("bookstore").find().toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    db.close();
  });
});


//dbo.collection("bookstore").find({"name":'Sex for dummies'}).toArray(function(err, result) {