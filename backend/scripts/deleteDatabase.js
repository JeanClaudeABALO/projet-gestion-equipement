/**
 * Script pour supprimer la base de données
 * Usage: node scripts/deleteDatabase.js
 */

require("dotenv").config();
const mysql = require("mysql2");

const dbName = process.env.DB_NAME || "gestion_equipement";

// Connexion sans base de données spécifique
const connection = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || ""
});

console.log("🗑️  Suppression de la base de données : " + dbName);
console.log("");

connection.connect((err) => {
    if (err) {
        console.error("❌ Erreur de connexion à MySQL :", err.message);
        process.exit(1);
    }

    console.log("✅ Connecté à MySQL");
    console.log("");

    // Supprimer la base de données
    connection.query(`DROP DATABASE IF EXISTS ${dbName}`, (err, result) => {
        if (err) {
            console.error("❌ Erreur lors de la suppression :", err.message);
            connection.end();
            process.exit(1);
        }

        console.log(`✅ Base de données '${dbName}' supprimée avec succès !`);
        connection.end();
        process.exit(0);
    });
});

