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

        // Vérifier si un super admin existe déjà
        const [existingSuperAdmins] = await db
            .promise()
            .query(
                `SELECT u.id FROM utilisateurs u 
                 JOIN roles r ON u.role_id = r.id 
                 WHERE r.code = 'super_admin'`
            );

        if (existingSuperAdmins.length > 0) {
            console.log("⚠️  Un super administrateur existe déjà. Aucune action effectuée.");
            console.log(`   Super Admin existant ID: ${existingSuperAdmins[0].id}`);
            process.exit(0);
        }

        // Récupérer l'ID du rôle super_admin
        const [roles] = await db
            .promise()
            .query("SELECT id FROM roles WHERE code = 'super_admin'");

        if (roles.length === 0) {
            console.error("❌ Erreur: Le rôle 'super_admin' n'existe pas dans la base de données.");
            console.error("   Veuillez exécuter la migration: database/migration_add_super_admin.sql");
            process.exit(1);
        }

        const superAdminRoleId = roles[0].id;

        // Informations de l'admin (à modifier selon vos besoins)
        const adminEmail = process.env.ADMIN_EMAIL || "admin@gestion-equipement.bj";
        const adminPassword = process.env.ADMIN_PASSWORD || "Admin@2025!";
        const adminNom = process.env.ADMIN_NOM || "Administrateur Principal";

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Créer le super admin (avec doit_changer_mdp = 0 pour le super admin principal)
        const [result] = await db
            .promise()
            .query(
                `INSERT INTO utilisateurs (nom, email, password, role_id, actif, doit_changer_mdp) 
                 VALUES (?, ?, ?, ?, 1, 0)`,
                [adminNom, adminEmail, hashedPassword, superAdminRoleId]
            );

        console.log("✅ Super administrateur créé avec succès !");
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

