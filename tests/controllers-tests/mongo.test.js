const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');
dotenv.config();

describe('insert', () => {

    let connection;
    let db;

    beforeAll(async () => {

        connection = await MongoClient.connect(process.env.MONGODB_URI, {

            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        db = await connection.db('customers')
    });

    afterAll(async() => {
        await connection.close()
    })

    // insert a customer in the database - test
    it('insert a customer into the collection', async () => {
        const users = db.collection('customers');

        //this will need to change to real details from our Mongodb
        const mockCustomer = {
            id: 'some-user-id',
            firstName: "Wade",
            lastName: "Harris",
            email: "wh@gmail.com",
            age: 25,
        }

        await users.insertOne(mockCustomer)

        const insertedCustomer = await users.findOne({ id: 'some-user-id' });

        expect(insertedCustomer).toEqual(mockCustomer)
    },
    
    //delete a customer form the database - test
    it('delete a customer from the collection', async () => {
        
        const users = db.collection('customers')
        await users.deleteMany({ id: 'some-user-id' })
        const deletedCustomer = await users.findOne({ id: 'some-user-id' });
        expect(deletedCustomer).toEqual(null)
    })
)})