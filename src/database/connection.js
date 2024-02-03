const client = require('mongodb').MongoClient;

let _db;

const initializeDb = async (callback) => {
    if (_db) {
        console.log('Database is already initialized!');
        return callback(null, _db);
    }

    try {
        const connection = await client.connect(process.env.MONGODB_URI);
        _db = connection.db(process.env.DB_NAME);
        callback(null, _db);
    } catch (error) {
        callback(error);
    }
};

const getConnection = () => {
    if (!_db) {
        throw Error('Database not initialized');
    }

    return _db;
}

module.exports = { initializeDb, getConnection };