const { Client } = require("pg");
const { DB_URI } = require("./config");



(async () => {
    console.log(DB_URI);
    db = new Client({ connectionString: DB_URI });
    console.log("here 1");
    await db.connect();
    console.log("here 2");
})().catch(e => {
    console.log("ERR REJECTION", e);
});;