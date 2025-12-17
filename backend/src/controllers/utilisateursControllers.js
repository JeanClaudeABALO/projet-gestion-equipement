const db = require("../config/db");
const bcrypt = require("bcryptjs");

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

    // Vérifier que seul un admin peut créer des utilisateurs
    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Seul un administrateur peut créer des utilisateurs"
        });
    }

    // Récupérer l'ID du rôle PF (code = "pf")
    const [pfRole] = await db
        .promise()
        .query("SELECT id FROM roles WHERE code = 'pf'");

    if (pfRole.length === 0) {
        return res.status(500).json({ message: "Rôle Point Focal introuvable dans la base" });
    }

    const pfRoleId = pfRole[0].id;

    // Si un role_id est fourni, vérifier qu'il ne s'agit pas d'un admin
    if (role_id) {
        const [roleData] = await db
            .promise()
            .query("SELECT code FROM roles WHERE id = ?", [role_id]);

        if (roleData.length === 0) {
            return res.status(400).json({ message: "Rôle invalide" });
        }

        const roleCode = roleData[0].code;

        // Empêcher la création d'un autre admin
        if (roleCode === "admin") {
            return res.status(403).json({
                message: "Il ne peut exister qu'un seul administrateur principal. Utilisez le script d'initialisation."
            });
        }
    }

    // Forcer le rôle à PF (seuls les PF peuvent être créés depuis cette interface)
    const finalRoleId = pfRoleId;

    // Vérifier que les PF ont un département
    if (!departement_id) {
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

    const sql = `
        INSERT INTO utilisateurs (nom, email, password, telephone, role_id, departement_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [nom, email, hashedPassword, telephone, finalRoleId, departement_id],
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

    // Empêcher la modification de l'admin principal
    if (currentUser.role_code === "admin") {
        return res.status(403).json({
            message: "L'administrateur principal ne peut pas être modifié depuis cette interface"
        });
    }

    // Si un role_id est fourni, vérifier qu'on ne tente pas de créer un admin
    if (role_id) {
        const [roleData] = await db
            .promise()
            .query("SELECT code FROM roles WHERE id = ?", [role_id]);

        if (roleData.length === 0) {
            return res.status(400).json({ message: "Rôle invalide" });
        }

        const roleCode = roleData[0].code;

        // Empêcher de changer le rôle en admin
        if (roleCode === "admin") {
            return res.status(403).json({
                message: "Il ne peut exister qu'un seul administrateur principal"
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
    const finalDepartementId = departement_id !== undefined ? departement_id : currentUser.departement_id;

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
exports.delete = (req, res) => {
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
