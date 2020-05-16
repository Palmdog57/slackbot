var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

const client = MongoClient(url, { useUnifiedTopology: true });

client.connect(function(err, db) {
    if (err) throw err;
    var dbo = db.db("hooli");
    var n = dbo.collection("bookstore").countDocuments();
    var r = Math.floor(Math.random() * n);
    var randomElement = dbo.collection("bookstore").find().limit(1).skip(r);

    console.log(randomElement);
});