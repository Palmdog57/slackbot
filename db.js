const MongoClient = require('mongodb').MongoClient;

let db;

const loadDB = async () => {
    if (db) {
        return db;
    }
    try {
        const client = await MongoClient.connect('mongodb://localhost:27017/slackbot', { useUnifiedTopology: true });
        db = client.db('slackbot');
    } catch (err) {
        console.log(err);
    }
    return db;
};

module.exports = loadDB;