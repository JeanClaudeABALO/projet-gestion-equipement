const db = require("../config/db");
const bcrypt = require("bcryptjs");
const { ensureDoitChangerMdpColumn } = require("../utils/dbMigration");

// ===========================
// Lister tous les utilisateurs
// ===========================
exports.getAll = (req, res) => {
    const sql = `
        SELECT u.*, r.libelle AS role_nom, d.nom AS departement_nom
        FROM utilisateurs u
        JOIN roles r ON u.role_id = r.id
        LEFT JOIN departements d ON u.departement_id = d.id
        ORDER BY u.id DESC
    `;

    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

// ===========================
// Récupérer un utilisateur
// ===========================
exports.getOne = (req, res) => {
    const sql = `
        SELECT u.*, r.libelle AS role_nom, d.nom AS departement_nom
        FROM utilisateurs u
        JOIN roles r ON u.role_id = r.id
        LEFT JOIN departements d ON u.departement_id = d.id
        WHERE u.id = ?
    `;

    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err });

        if (results.length === 0)
            return res.status(404).json({ message: "Utilisateur non trouvé" });

        res.json(results[0]);
    });
};

// ===========================
// Ajouter un utilisateur
// ===========================
exports.create = async (req, res) => {
    const { nom, email, password, telephone, role_id, departement_id } = req.body;

    // Validation des champs obligatoires (role_id sera déterminé automatiquement)
    if (!nom || !email || !password) {
        return res.status(400).json({
            message: "nom, email et password sont obligatoires"
        });
    }

    // Déterminer le rôle à créer
    let finalRoleId;
    
    if (role_id) {
        // Vérifier que le rôle existe
        const [roleData] = await db
            .promise()
            .query("SELECT code FROM roles WHERE id = ?", [role_id]);

        if (roleData.length === 0) {
            return res.status(400).json({ message: "Rôle invalide" });
        }

        const roleCode = roleData[0].code;

        // Empêcher la création d'un autre super_admin
        if (roleCode === "super_admin") {
            return res.status(403).json({
                message: "Il ne peut exister qu'un seul super administrateur."
            });
        }

        // Si l'utilisateur est admin (pas super_admin), il ne peut créer que des points focaux
        if (req.user.role === "admin" && roleCode !== "pf") {
            return res.status(403).json({
                message: "Vous ne pouvez créer que des points focaux."
            });
        }

        finalRoleId = role_id;
    } else {
        // Par défaut, créer un PF
        const [pfRole] = await db
            .promise()
            .query("SELECT id FROM roles WHERE code = 'pf'");

        if (pfRole.length === 0) {
            return res.status(500).json({ message: "Rôle Point Focal introuvable dans la base" });
        }

        finalRoleId = pfRole[0].id;
    }

    // Vérifier que les PF ont un département (pas nécessaire pour les admins)
    const [roleCheck] = await db
        .promise()
        .query("SELECT code FROM roles WHERE id = ?", [finalRoleId]);
    
    if (roleCheck.length > 0 && roleCheck[0].code === "pf" && !departement_id) {
        return res.status(400).json({
            message: "Un Point Focal doit être rattaché à un département"
        });
    }

    // Vérifier que l'email n'existe pas déjà
    const [existing] = await db
        .promise()
        .query("SELECT id FROM utilisateurs WHERE email = ?", [email]);

    if (existing.length > 0) {
        return res.status(400).json({
            message: "Cet email est déjà utilisé"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Vérifier que la colonne existe avant de l'utiliser
    await ensureDoitChangerMdpColumn();

    // Pour les admins, departement_id est NULL
    const finalDepartementId = (roleCheck[0].code === "pf") ? departement_id : null;

    const sql = `
        INSERT INTO utilisateurs (nom, email, password, telephone, role_id, departement_id, doit_changer_mdp)
        VALUES (?, ?, ?, ?, ?, ?, 1)
    `;

    db.query(
        sql,
        [nom, email, hashedPassword, telephone, finalRoleId, finalDepartementId],
        (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({ message: "Cet email est déjà utilisé" });
                }
                return res.status(500).json({ error: err });
            }

            res.json({
                message: "Utilisateur créé avec succès",
                id: result.insertId
            });
        }
    );
};

// ===========================
// Modifier un utilisateur
// ===========================
exports.update = async (req, res) => {
    const { nom, email, password, telephone, role_id, departement_id, actif } =
        req.body;

    if (!nom || !email) {
        return res.status(400).json({
            message: "nom et email sont obligatoires"
        });
    }

    // Vérifier que seul un super_admin peut modifier des utilisateurs
    if (req.user.role !== "super_admin") {
        return res.status(403).json({
            message: "Seul un super administrateur peut modifier des utilisateurs"
        });
    }

    // Vérifier que l'utilisateur existe et récupérer son rôle actuel
    const [existingUser] = await db
        .promise()
        .query(
            `SELECT u.*, r.code AS role_code 
             FROM utilisateurs u 
             JOIN roles r ON u.role_id = r.id 
             WHERE u.id = ?`,
            [req.params.id]
        );

    if (existingUser.length === 0) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    const currentUser = existingUser[0];

    // Empêcher la modification du super_admin
    if (currentUser.role_code === "super_admin") {
        return res.status(403).json({
            message: "Le super administrateur ne peut pas être modifié depuis cette interface"
        });
    }

    // Si un role_id est fourni, vérifier qu'on ne tente pas de créer un super_admin
    if (role_id) {
        const [roleData] = await db
            .promise()
            .query("SELECT code FROM roles WHERE id = ?", [role_id]);

        if (roleData.length === 0) {
            return res.status(400).json({ message: "Rôle invalide" });
        }

        const roleCode = roleData[0].code;

        // Empêcher de changer le rôle en super_admin
        if (roleCode === "super_admin") {
            return res.status(403).json({
                message: "Il ne peut exister qu'un seul super administrateur"
            });
        }

        // Si on change en PF, vérifier qu'un département est fourni
        if (roleCode === "pf" && !departement_id) {
            return res.status(400).json({
                message: "Un Point Focal doit être rattaché à un département"
            });
        }
    }

    // Vérifier que l'email n'est pas déjà utilisé par un autre utilisateur
    const [emailCheck] = await db
        .promise()
        .query("SELECT id FROM utilisateurs WHERE email = ? AND id != ?", [email, req.params.id]);

    if (emailCheck.length > 0) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
    }

    let hashedPassword = null;

    // Si un mot de passe est envoyé, on le re-hash
    if (password && password !== "") {
        hashedPassword = await bcrypt.hash(password, 10);
    }

    // Utiliser le role_id fourni ou garder l'actuel
    const finalRoleId = role_id || currentUser.role_id;
    
    // Pour les admins, departement_id doit être NULL
    let finalDepartementId;
    if (role_id) {
        const [newRoleData] = await db
            .promise()
            .query("SELECT code FROM roles WHERE id = ?", [role_id]);
        if (newRoleData.length > 0 && newRoleData[0].code === "admin") {
            finalDepartementId = null;
        } else {
            finalDepartementId = departement_id !== undefined ? departement_id : currentUser.departement_id;
        }
    } else {
        finalDepartementId = departement_id !== undefined ? departement_id : currentUser.departement_id;
    }

    const sql = `
        UPDATE utilisateurs
        SET nom = ?, email = ?, password = COALESCE(?, password),
            telephone = ?, role_id = ?, departement_id = ?, actif = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            nom,
            email,
            hashedPassword,
            telephone,
            finalRoleId,
            finalDepartementId,
            actif !== undefined ? actif : currentUser.actif,
            req.params.id
        ],
        (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({ message: "Cet email est déjà utilisé" });
                }
                return res.status(500).json({ error: err });
            }

            if (result.affectedRows === 0)
                return res
                    .status(404)
                    .json({ message: "Utilisateur non trouvé" });

            res.json({
                message: "Utilisateur modifié avec succès"
            });
        }
    );
};

// ===========================
// Supprimer un utilisateur
// ===========================
exports.delete = async (req, res) => {
    // Vérifier que seul un super_admin peut supprimer des utilisateurs
    if (req.user.role !== "super_admin") {
        return res.status(403).json({
            message: "Seul un super administrateur peut supprimer des utilisateurs"
        });
    }

    // Vérifier que l'utilisateur existe et récupérer son rôle
    const [existingUser] = await db
        .promise()
        .query(
            `SELECT u.*, r.code AS role_code 
             FROM utilisateurs u 
             JOIN roles r ON u.role_id = r.id 
             WHERE u.id = ?`,
            [req.params.id]
        );

    if (existingUser.length === 0) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Empêcher la suppression du super_admin
    if (existingUser[0].role_code === "super_admin") {
        return res.status(403).json({
            message: "Le super administrateur ne peut pas être supprimé"
        });
    }

    db.query(
        "DELETE FROM utilisateurs WHERE id = ?",
        [req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });

            if (result.affectedRows === 0)
                return res.status(404).json({
                    message: "Utilisateur non trouvé"
                });

            res.json({ message: "Utilisateur supprimé avec succès" });
        }
    );
};
