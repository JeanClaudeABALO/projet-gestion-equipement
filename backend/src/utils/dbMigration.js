const db = require("../config/db");

/**
 * Vérifie et crée la colonne doit_changer_mdp si elle n'existe pas
 * @returns {Promise<boolean>} true si la colonne existe ou a été créée, false en cas d'erreur
 */
async function ensureDoitChangerMdpColumn() {
    try {
        const [columns] = await db
            .promise()
            .query(`
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_SCHEMA = DATABASE() 
                AND TABLE_NAME = 'utilisateurs' 
                AND COLUMN_NAME = 'doit_changer_mdp'
            `);
        
        if (columns.length === 0) {
            // Créer la colonne doit_changer_mdp
            await db
                .promise()
                .query(`
                    ALTER TABLE utilisateurs
                    ADD COLUMN doit_changer_mdp TINYINT(1) NOT NULL DEFAULT 1
                    AFTER actif
                `);
            console.log("✅ Colonne doit_changer_mdp créée automatiquement");
            return true;
        }
        return true;
    } catch (error) {
        console.error("❌ Erreur lors de la vérification/création de la colonne doit_changer_mdp:", error);
        return false;
    }
}

/**
 * Vérifie et crée le rôle super_admin s'il n'existe pas
 * @returns {Promise<number|null>} L'ID du rôle super_admin ou null en cas d'erreur
 */
async function ensureSuperAdminRole() {
    try {
        let [roles] = await db
            .promise()
            .query("SELECT id FROM roles WHERE code = 'super_admin'");

        if (roles.length === 0) {
            // Créer le rôle super_admin
            const [insertResult] = await db
                .promise()
                .query(
                    "INSERT INTO roles (code, libelle) VALUES (?, ?)",
                    ['super_admin', 'Super Administrateur']
                );
            console.log("✅ Rôle super_admin créé automatiquement");
            return insertResult.insertId;
        }
        return roles[0].id;
    } catch (error) {
        console.error("❌ Erreur lors de la vérification/création du rôle super_admin:", error);
        return null;
    }
}

module.exports = {
    ensureDoitChangerMdpColumn,
    ensureSuperAdminRole
};

