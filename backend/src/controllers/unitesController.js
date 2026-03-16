const db = require("../config/db");

// ==========================
// Lister toutes les unités
// ==========================
exports.getAll = async (req, res) => {
    try {
        // Si l'utilisateur est Point Focal, filtrer par son département
        if (req.user.role === "pf") {
            const [userData] = await db
                .promise()
                .query("SELECT departement_id FROM utilisateurs WHERE id = ?", [req.user.id]);

            if (!userData[0] || !userData[0].departement_id) {
                return res.status(403).json({ message: "Vous n'êtes rattaché à aucun département" });
            }

            const departementId = userData[0].departement_id;

            const sql = `
                SELECT u.*, d.nom AS departement_nom
                FROM unites u
                JOIN departements d ON u.departement_id = d.id
                WHERE u.departement_id = ?
                ORDER BY u.id DESC
            `;

            db.query(sql, [departementId], (err, results) => {
                if (err) return res.status(500).json({ error: err });
                res.json(results);
            });
        } else {
            // Admin : toutes les unités
            const sql = `
                SELECT u.*, d.nom AS departement_nom
                FROM unites u
                JOIN departements d ON u.departement_id = d.id
                ORDER BY u.id DESC
            `;

            db.query(sql, (err, results) => {
                if (err) return res.status(500).json({ error: err });
                res.json(results);
            });
        }
    } catch (error) {
        console.error("Erreur liste unités:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// ==========================
// Récupérer une unité
// ==========================
exports.getOne = (req, res) => {
    const sql = `
        SELECT u.*, d.nom AS departement_nom
        FROM unites u
        JOIN departements d ON u.departement_id = d.id
        WHERE u.id = ?
    `;

    db.query(sql, [req.params.id], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (results.length === 0) return res.status(404).json({ message: "Unité non trouvée" });
        res.json(results[0]);
    });
};

// ==========================
// Ajouter une unité
// ==========================
exports.create = async (req, res) => {
    const { nom, reference, departement_id, adresse, contact } = req.body;

    try {
        // Si l'utilisateur est Point Focal, récupérer son département et l'utiliser automatiquement
        if (req.user.role === "pf") {
            const [userData] = await db
                .promise()
                .query("SELECT departement_id FROM utilisateurs WHERE id = ?", [req.user.id]);

            if (!userData[0] || !userData[0].departement_id) {
                return res.status(403).json({ message: "Vous n'êtes rattaché à aucun département" });
            }

            const pfDepartementId = userData[0].departement_id;

            // Pour un point focal, utiliser TOUJOURS son département (ignorer celui fourni dans la requête)
            // Si un departement_id est fourni, vérifier qu'il correspond au département du PF
            if (departement_id && Number(departement_id) !== Number(pfDepartementId)) {
                return res.status(403).json({
                    message: "Vous ne pouvez créer des unités que dans votre département"
                });
            }

            // Vérifier que le nom est fourni
            if (!nom) {
                return res.status(400).json({ message: "Le nom de l'unité est obligatoire" });
            }

            // Utiliser automatiquement le département du point focal
            const finalDepartementId = Number(pfDepartementId);

            const sql = `
                INSERT INTO unites (nom, reference, departement_id, adresse, contact)
                VALUES (?, ?, ?, ?, ?)
            `;

            db.query(sql, [nom, reference, finalDepartementId, adresse, contact], (err, result) => {
                if (err) return res.status(500).json({ error: err });

                res.json({
                    message: "Unité ajoutée avec succès",
                    id: result.insertId
                });
            });
            return;
        }

        // Pour les admins, vérifier que nom et departement_id sont fournis
        if (!nom || !departement_id) {
            return res.status(400).json({ message: "nom et departement_id sont obligatoires" });
        }

        const sql = `
            INSERT INTO unites (nom, reference, departement_id, adresse, contact)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(sql, [nom, reference, departement_id, adresse, contact], (err, result) => {
            if (err) return res.status(500).json({ error: err });

            res.json({
                message: "Unité ajoutée avec succès",
                id: result.insertId
            });
        });
    } catch (error) {
        console.error("Erreur création unité:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// ==========================
// Modifier une unité
// ==========================
exports.update = async (req, res) => {
    const { nom, reference, departement_id, adresse, contact } = req.body;

    try {
        // Si l'utilisateur est Point Focal, utiliser automatiquement son département
        if (req.user.role === "pf") {
            // Vérifier que le nom est fourni
            if (!nom) {
                return res.status(400).json({ message: "Le nom de l'unité est obligatoire" });
            }

            // Récupérer le département du point focal
            const [userData] = await db
                .promise()
                .query("SELECT departement_id FROM utilisateurs WHERE id = ?", [req.user.id]);

            if (!userData[0] || !userData[0].departement_id) {
                return res.status(403).json({ message: "Vous n'êtes rattaché à aucun département" });
            }

            const pfDepartementId = userData[0].departement_id;

            // Vérifier que l'unité existe et appartient au département du PF
            const [uniteData] = await db
                .promise()
                .query("SELECT departement_id FROM unites WHERE id = ?", [req.params.id]);

            if (uniteData.length === 0) {
                return res.status(404).json({ message: "Unité non trouvée" });
            }

            // Vérifier que l'unité appartient au département du PF
            if (Number(uniteData[0].departement_id) !== Number(pfDepartementId)) {
                return res.status(403).json({
                    message: "Vous ne pouvez modifier que les unités de votre département"
                });
            }

            // Utiliser automatiquement le département du PF (ignorer celui fourni dans la requête)
            const finalDepartementId = Number(pfDepartementId);

            // Si un departement_id est fourni, vérifier qu'il correspond (mais on l'ignore quand même)
            if (departement_id && Number(departement_id) !== Number(pfDepartementId)) {
                return res.status(403).json({
                    message: "Vous ne pouvez pas changer le département d'une unité"
                });
            }

            // Utiliser le département du PF pour la mise à jour
            const sql = `
                UPDATE unites
                SET nom = ?, reference = ?, departement_id = ?, adresse = ?, contact = ?
                WHERE id = ?
            `;

            db.query(sql, [nom, reference, finalDepartementId, adresse, contact, req.params.id], (err, result) => {
                if (err) return res.status(500).json({ error: err });

                if (result.affectedRows === 0) {
                    return res.status(404).json({ message: "Unité non trouvée" });
                }

                res.json({ message: "Unité mise à jour avec succès" });
            });
            return;
        }

        // Pour les admins, vérifier que nom et departement_id sont fournis
        if (!nom || !departement_id) {
            return res.status(400).json({ message: "nom et departement_id sont obligatoires" });
        }

        const sql = `
            UPDATE unites
            SET nom = ?, reference = ?, departement_id = ?, adresse = ?, contact = ?
            WHERE id = ?
        `;

        db.query(sql, [nom, reference, departement_id, adresse, contact, req.params.id], (err, result) => {
            if (err) return res.status(500).json({ error: err });

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Unité non trouvée" });
            }

            res.json({ message: "Unité mise à jour avec succès" });
        });
    } catch (error) {
        console.error("Erreur modification unité:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// ==========================
// Supprimer une unité
// ==========================
exports.delete = async (req, res) => {
    try {
        // Si l'utilisateur est Point Focal, vérifier qu'il supprime une unité de son département
        if (req.user.role === "pf") {
            const [uniteData] = await db
                .promise()
                .query("SELECT departement_id FROM unites WHERE id = ?", [req.params.id]);

            if (uniteData.length === 0) {
                return res.status(404).json({ message: "Unité non trouvée" });
            }

            const [userData] = await db
                .promise()
                .query("SELECT departement_id FROM utilisateurs WHERE id = ?", [req.user.id]);

            if (!userData[0] || !userData[0].departement_id) {
                return res.status(403).json({ message: "Vous n'êtes rattaché à aucun département" });
            }

            const pfDepartementId = userData[0].departement_id;

            if (Number(uniteData[0].departement_id) !== Number(pfDepartementId)) {
                return res.status(403).json({
                    message: "Vous ne pouvez supprimer que les unités de votre département"
                });
            }
        }

        db.query("DELETE FROM unites WHERE id = ?", [req.params.id], (err, result) => {
            if (err) return res.status(500).json({ error: err });

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Unité non trouvée" });
            }

            res.json({ message: "Unité supprimée avec succès" });
        });
    } catch (error) {
        console.error("Erreur suppression unité:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};
