const {MongoClient} = require('mongodb');
const executeDBRequest = require("./executeDBRequest");

async function dbClient(props) {
    try {
        const client = new MongoClient(
            'mongodb://teacher:xjkYX2t5Nm@localhost:27017',
            {useUnifiedTopology: true});
        await client.connect();
        const db = client.db('LMSData');
        //console.log('dbClient: result = %o', result);
        const response = await executeDBRequest(db, props);
        //console.log("dbClient, response =", response);
        client.close().catch(e => console.warn(e));
        return response;
    } catch (e) {
        console.error(e)
        throw e
    }
}

module.exports = dbClient;