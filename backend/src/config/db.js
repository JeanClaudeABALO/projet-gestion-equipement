const mysql = require("mysql2");
require("dotenv").config();

// Vérifier que les variables d'environnement sont définies
const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_NAME", "JWT_SECRET"];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error("❌ Variables d'environnement manquantes:", missingVars.join(", "));
    console.error("   Veuillez créer un fichier .env dans le dossier backend/ avec ces variables");
    process.exit(1);
}

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
});

// Tester la connexion au démarrage
db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Erreur de connexion MySQL :", err.message);
        console.error("   Vérifiez vos paramètres de connexion dans le fichier .env");
        if (err.code === "ER_ACCESS_DENIED_ERROR") {
            console.error("   → Erreur d'authentification : vérifiez DB_USER et DB_PASSWORD");
        } else if (err.code === "ECONNREFUSED") {
            console.error("   → Serveur MySQL inaccessible : vérifiez que MySQL est démarré");
        } else if (err.code === "ER_BAD_DB_ERROR") {
            console.error("   → Base de données introuvable : vérifiez DB_NAME et exécutez schema.sql");
        }
    } else {
        console.log("✅ Connecté à MySQL");
        console.log(`   Base de données: ${process.env.DB_NAME}`);
        connection.release();
    }
});

module.exports = db;
