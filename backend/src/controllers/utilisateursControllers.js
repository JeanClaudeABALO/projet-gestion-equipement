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

    if (!nom || !email || !password || !role_id) {
        return res.status(400).json({
            message: "nom, email, password et role_id sont obligatoires"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
        INSERT INTO utilisateurs (nom, email, password, telephone, role_id, departement_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [nom, email, hashedPassword, telephone, role_id, departement_id || null],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });

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

    if (!nom || !email || !role_id) {
        return res.status(400).json({
            message: "nom, email et role_id sont obligatoires"
        });
    }

    let hashedPassword = null;

    // Si un mot de passe est envoyé, on le re-hash
    if (password && password !== "") {
        hashedPassword = await bcrypt.hash(password, 10);
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
            role_id,
            departement_id || null,
            actif,
            req.params.id
        ],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });

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
