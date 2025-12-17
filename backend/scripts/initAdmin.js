/**
 * Script d'initialisation pour créer l'administrateur principal
 * À exécuter UNE SEULE FOIS au démarrage du système
 * 
 * Usage: node scripts/initAdmin.js
 */

require("dotenv").config();
const db = require("../src/config/db");
const bcrypt = require("bcryptjs");

async function initAdmin() {
    try {
        console.log("🔐 Initialisation de l'administrateur principal...");

        // Vérifier si un admin existe déjà
        const [existingAdmins] = await db
            .promise()
            .query(
                `SELECT u.id FROM utilisateurs u 
                 JOIN roles r ON u.role_id = r.id 
                 WHERE r.code = 'admin'`
            );

        if (existingAdmins.length > 0) {
            console.log("⚠️  Un administrateur existe déjà. Aucune action effectuée.");
            console.log(`   Admin existant ID: ${existingAdmins[0].id}`);
            process.exit(0);
        }

        // Récupérer l'ID du rôle admin
        const [roles] = await db
            .promise()
            .query("SELECT id FROM roles WHERE code = 'admin'");

        if (roles.length === 0) {
            console.error("❌ Erreur: Le rôle 'admin' n'existe pas dans la base de données.");
            process.exit(1);
        }

        const adminRoleId = roles[0].id;

        // Informations de l'admin (à modifier selon vos besoins)
        const adminEmail = process.env.ADMIN_EMAIL || "admin@gestion-equipement.bj";
        const adminPassword = process.env.ADMIN_PASSWORD || "Admin@2025!";
        const adminNom = process.env.ADMIN_NOM || "Administrateur Principal";

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Créer l'admin
        const [result] = await db
            .promise()
            .query(
                `INSERT INTO utilisateurs (nom, email, password, role_id, actif) 
                 VALUES (?, ?, ?, ?, 1)`,
                [adminNom, adminEmail, hashedPassword, adminRoleId]
            );

        console.log("✅ Administrateur principal créé avec succès !");
        console.log(`   ID: ${result.insertId}`);
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Mot de passe: ${adminPassword}`);
        console.log("\n⚠️  IMPORTANT: Changez ce mot de passe après la première connexion !");
        console.log("   Vous pouvez définir ADMIN_EMAIL et ADMIN_PASSWORD dans le fichier .env");

        process.exit(0);
    } catch (error) {
        console.error("❌ Erreur lors de l'initialisation:", error);
        process.exit(1);
    }
}

initAdmin();

