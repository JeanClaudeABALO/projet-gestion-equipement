const mysql = require("mysql2");

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    connectionLimit: 10
});

db.getConnection((err, connection) => {
    if (err) {
        console.error("Erreur de connexion MySQL :", err);
    } else {
        console.log("Connecté à MySQL");
        connection.release();
    }
});

module.exports = db;
