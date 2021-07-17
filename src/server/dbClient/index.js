import {DB_ACCESS} from "../MongoDBDataSource/accessConsts";

const {MongoClient} = require('mongodb');
const executeDBRequest = require("./executeDBRequest");

export async function dbClient(props) {
    try {
        const client = new MongoClient(
            DB_ACCESS,
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

// module.exports = dbClient;