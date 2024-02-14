/** 
 * @typedef {import('mongodb').Db} Db MongoDB database.
 */

const client = require('mongodb').MongoClient;

/**
 * @private
 * @type {Db}
 */
let _db;

/**
 * Callback function for database initialization.
 * @callback InitializeDbCallback
 * @param {Error} [error] An error object if the initialization fails.
 * @param {Db} [_db] The initialized database instance.
 */

/**
 * Initialize the database instance. 
 * @param {InitializeDbCallback} callback Callback function called after initialization.
 * @returns {Promise} A Promise that resolves after the initialization.
 * @throws {Error} If an error occurs during database initialization. 
 */
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

/**
 * Get the databse instance.
 * @returns {Db} The database instance. 
 * @throws {Error} If the database is not initialized.
 */
const getConnection = () => {
    if (!_db) {
        throw Error('Database not initialized');
    }

    return _db;
}

module.exports = { initializeDb, getConnection };