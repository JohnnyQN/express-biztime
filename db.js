const { Client } = require("pg");
require("dotenv").config();

const DB_URI = process.env.NODE_ENV === "test"
  ? "postgresql:///biztime_test"
  : "postgresql:///biztime";

const client = new Client({
  connectionString: DB_URI,
});

client.connect();

module.exports = client;
