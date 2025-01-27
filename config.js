/** Common config for bookstore. */
require('dotenv').config();
console.log("Environment Variables: ", process.env.DB_USERNAME, process.env.DB_PASSWORD, process.env.NODE_ENV, process.env.DATABASE_URL);

let DB_URI;

if (process.env.NODE_ENV === "test") {
    const passwordEncoded = encodeURIComponent(process.env.DB_PASSWORD);
    DB_URI = `postgresql://${process.env.DB_USERNAME}:${passwordEncoded}@localhost:5432/bookstore_test`;
} else {
    const passwordEncoded = encodeURIComponent(process.env.DB_PASSWORD);
    DB_URI = `postgresql://${process.env.DB_USERNAME}:${passwordEncoded}@localhost:5432/bookstore`;
}

console.log("DB_URI: ", DB_URI);


module.exports = { DB_URI };