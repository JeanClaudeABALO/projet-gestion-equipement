const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ensureDoitChangerMdpColumn, ensureSuperAdminRole } = require("../utils/dbMigration");

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email et mot de passe sont obligatoires" });
        }

        // Vérifier que JWT_SECRET est défini
        if (!process.env.JWT_SECRET) {
            console.error("❌ JWT_SECRET n'est pas défini dans les variables d'environnement");
            return res.status(500).json({ message: "Erreur de configuration serveur" });
        }

        // Vérifier l'utilisateur par email uniquement (le rôle sera détecté automatiquement)
        const [rows] = await db
            .promise()
            .query(
                `SELECT u.*, r.code as role_code, r.libelle as role_libelle 
                 FROM utilisateurs u 
                 JOIN roles r ON u.role_id = r.id 
                 WHERE u.email = ?`,
                [email]
            );

        if (rows.length === 0) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect" });
        }

        const user = rows[0];
        const role = user.role_code; // Rôle détecté automatiquement

        // Vérifier que l'utilisateur est actif
        if (!user.actif) {
            return res.status(403).json({ message: "Votre compte a été désactivé" });
        }

        // Vérifier mot de passe
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Mot de passe incorrect" });
        }

        // Vérifier si l'utilisateur doit changer son mot de passe (si la colonne existe)
        // Si la colonne n'existe pas, on considère que doit_changer_mdp = 0 (pas de changement forcé)
        if (user.doit_changer_mdp !== undefined && user.doit_changer_mdp === 1) {
            // Ne pas créer de token, demander le changement de mot de passe
            return res.json({
                forcePasswordChange: true,
                userId: user.id,
                message: "Vous devez changer votre mot de passe avant de continuer"
            });
        }

        // Mettre à jour last_login
        await db
            .promise()
            .query("UPDATE utilisateurs SET last_login = NOW() WHERE id = ?", [user.id]);

        // Création token avec le rôle détecté
        const token = jwt.sign(
            {
                id: user.id,
                role: role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "8h" }
        );

        res.json({
            message: "Connexion réussie",
            token,
            role,
            user: {
                id: user.id,
                nom: user.nom,
                email: user.email,
                role: role,
                roleLibelle: user.role_libelle
            }
        });
    } catch (error) {
        console.error("❌ Erreur lors de la connexion:", error);
        res.status(500).json({ 
            message: "Erreur de connexion", 
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

// ===========================
// Changer le mot de passe (pour utilisateurs connectés ou forcés)
// ===========================
exports.changePassword = async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;

        if (!userId || !newPassword) {
            return res.status(400).json({ 
                message: "userId et nouveau mot de passe sont obligatoires" 
            });
        }

        // Récupérer l'utilisateur
        const [users] = await db
            .promise()
            .query("SELECT * FROM utilisateurs WHERE id = ?", [userId]);

        if (users.length === 0) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        const user = users[0];

        // Si oldPassword est fourni, vérifier qu'il est correct (pour changement normal)
        if (oldPassword) {
            const match = await bcrypt.compare(oldPassword, user.password);
            if (!match) {
                return res.status(401).json({ message: "Ancien mot de passe incorrect" });
            }
        }
        // Si oldPassword n'est pas fourni, c'est un changement forcé (doit_changer_mdp = 1)
        // Dans ce cas, on ne vérifie pas l'ancien mot de passe

        // Valider le nouveau mot de passe (min 6 caractères)
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                message: "Le mot de passe doit contenir au moins 6 caractères" 
            });
        }

        // Hasher le nouveau mot de passe
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Vérifier que la colonne existe avant de l'utiliser
        await ensureDoitChangerMdpColumn();
        
        // Mettre à jour le mot de passe et désactiver le flag doit_changer_mdp
        await db
            .promise()
            .query(
                `UPDATE utilisateurs 
                 SET password = ?, doit_changer_mdp = 0 
                 WHERE id = ?`,
                [hashedPassword, userId]
            );

        res.json({
            message: "Mot de passe changé avec succès"
        });
    } catch (error) {
        console.error("❌ Erreur lors du changement de mot de passe:", error);
        res.status(500).json({ 
            message: "Erreur lors du changement de mot de passe", 
            error: process.env.NODE_ENV === "development" ? error.message : undefined
        });
    }
};

// Vérifier si un super admin existe déjà
exports.checkAdminExists = async (req, res) => {
    try {
        const [superAdmins] = await db
            .promise()
            .query(
                `SELECT u.id FROM utilisateurs u 
                 JOIN roles r ON u.role_id = r.id 
                 WHERE r.code = 'super_admin'`
            );

        res.json({ exists: superAdmins.length > 0 });
    } catch (error) {
        console.error("Erreur vérification super admin:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Créer l'administrateur principal (uniquement si aucun admin n'existe)
exports.registerAdmin = async (req, res) => {
    try {
        const { nom, email, password } = req.body;

        if (!nom || !email || !password) {
            return res.status(400).json({ 
                message: "Nom, email et mot de passe sont obligatoires" 
            });
        }

        // Vérifier qu'aucun super admin n'existe déjà
        // D'abord vérifier si le rôle existe, sinon on continue (première installation)
        let [roleCheck] = await db
            .promise()
            .query("SELECT id FROM roles WHERE code = 'super_admin'");
        
        if (roleCheck.length > 0) {
            // Le rôle existe, vérifier s'il y a déjà un super admin
            const [existingSuperAdmins] = await db
                .promise()
                .query(
                    `SELECT u.id FROM utilisateurs u 
                     JOIN roles r ON u.role_id = r.id 
                     WHERE r.code = 'super_admin'`
                );

            if (existingSuperAdmins.length > 0) {
                return res.status(403).json({ 
                    message: "Un super administrateur existe déjà. L'inscription est fermée." 
                });
            }
        }

        // Vérifier que l'email n'est pas déjà utilisé
        const [existingEmail] = await db
            .promise()
            .query("SELECT id FROM utilisateurs WHERE email = ?", [email]);

        if (existingEmail.length > 0) {
            return res.status(400).json({ message: "Cet email est déjà utilisé" });
        }

        // Vérifier et créer le rôle super_admin s'il n'existe pas
        const superAdminRoleId = await ensureSuperAdminRole();
        if (!superAdminRoleId) {
            return res.status(500).json({ 
                message: "Erreur lors de la création du rôle super administrateur. Veuillez exécuter la migration SQL.",
                error: process.env.NODE_ENV === "development" ? "Impossible de créer le rôle super_admin" : undefined
            });
        }

        // Vérifier et créer la colonne doit_changer_mdp si elle n'existe pas
        const columnExists = await ensureDoitChangerMdpColumn();
        if (!columnExists) {
            return res.status(500).json({ 
                message: "Erreur lors de la vérification de la structure de la base de données. Veuillez exécuter la migration SQL.",
                error: process.env.NODE_ENV === "development" ? "Impossible de créer la colonne doit_changer_mdp" : undefined
            });
        }

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer le super admin (avec doit_changer_mdp = 0 pour le super admin principal)
        const [result] = await db
            .promise()
            .query(
                `INSERT INTO utilisateurs (nom, email, password, role_id, actif, doit_changer_mdp) 
                 VALUES (?, ?, ?, ?, 1, 0)`,
                [nom, email, hashedPassword, superAdminRoleId]
            );

        if (!result || !result.insertId) {
            return res.status(500).json({ 
                message: "Erreur lors de la création du super administrateur. Aucun ID retourné."
            });
        }

        res.json({
            message: "Super administrateur créé avec succès",
            id: result.insertId
        });
    } catch (error) {
        console.error("❌ Erreur création super admin:", error);
        console.error("❌ Détails de l'erreur:", {
            message: error.message,
            code: error.code,
            sqlMessage: error.sqlMessage,
            sql: error.sql
        });
        
        // Messages d'erreur plus spécifiques
        let errorMessage = "Erreur serveur lors de la création du super administrateur";
        
        if (error.code === 'ER_DUP_ENTRY') {
            errorMessage = "Cet email est déjà utilisé";
        } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
            errorMessage = "Le rôle super_admin n'existe pas. Veuillez exécuter la migration SQL.";
        } else if (error.sqlMessage) {
            errorMessage = `Erreur SQL: ${error.sqlMessage}`;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        res.status(500).json({ 
            message: errorMessage,
            error: process.env.NODE_ENV === "development" ? {
                message: error.message,
                code: error.code,
                sqlMessage: error.sqlMessage
            } : undefined
        });
    }
};
