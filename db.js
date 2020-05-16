const MongoClient = require('mongodb').MongoClient;

let db;

const urlConstructor = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@localhost:27017/slackbot`

const loadDB = async () => {
    if (db) {
        return db;
    }
    try {
        const client = await MongoClient.connect(urlConstructor, { useUnifiedTopology: true });
        db = client.db('slackbot');
        console.log("Success.");
    } catch (err) {
        console.log(err);
    }
    return db;
};

module.exports = loadDB;