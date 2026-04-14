const db = require("../config/db");

// ===========================
// LISTE DES RÉPARATIONS (ADMIN)
// ===========================
exports.getAll = (req, res) => {
    const sql = `
        SELECT d.*, 
               e.id AS equipement_id,
               e.quantite,
               t.nom AS type_nom,
               u.nom AS demandeur_nom,
               dept.id AS departement_id,
               dept.nom AS departement_nom,
               un.id AS unite_id,
               un.nom AS unite_nom
        FROM demandes_reparation d
        JOIN equipements e ON d.equipement_id = e.id
        JOIN equipements_types t ON e.type_id = t.id
        JOIN unites un ON e.unite_id = un.id
        JOIN departements dept ON un.departement_id = dept.id
        LEFT JOIN utilisateurs u ON d.demande_par = u.id
        ORDER BY d.id DESC
    `;

    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ error: err });
        res.json(rows);
    });
};

// ===========================
// RÉPARATIONS DU DÉPARTEMENT (PF)
// ===========================
exports.getByDepartement = async (req, res) => {
    try {
        if (req.user.role !== "pf") {
            return res.status(403).json({ message: "Accès réservé aux Points Focaux" });
        }

        const [userData] = await db
            .promise()
            .query("SELECT departement_id FROM utilisateurs WHERE id = ?", [req.user.id]);

        if (!userData[0] || !userData[0].departement_id) {
            return res.status(403).json({ message: "Vous n'êtes rattaché à aucun département" });
        }

        const departementId = userData[0].departement_id;

        const sql = `
            SELECT d.*, 
                   e.id AS equipement_id,
                   e.quantite,
                   t.nom AS type_nom,
                   u.nom AS demandeur_nom,
                   dept.id AS departement_id,
                   dept.nom AS departement_nom,
                   un.id AS unite_id,
                   un.nom AS unite_nom
            FROM demandes_reparation d
            JOIN equipements e ON d.equipement_id = e.id
            JOIN equipements_types t ON e.type_id = t.id
            JOIN unites un ON e.unite_id = un.id
            JOIN departements dept ON un.departement_id = dept.id
            LEFT JOIN utilisateurs u ON d.demande_par = u.id
            WHERE dept.id = ?
            ORDER BY d.id DESC
        `;

        db.query(sql, [departementId], (err, rows) => {
            if (err) return res.status(500).json({ error: err });
            res.json(rows);
        });
    } catch (error) {
        console.error("Erreur getByDepartement:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// ===========================
// DÉCLARATION DE PANNE (PF)
// ===========================
exports.create = async (req, res) => {
    try {
        const { equipement_id, description } = req.body;

        if (!equipement_id || !description) {
            return res.status(400).json({
                message: "equipement_id et description sont obligatoires"
            });
        }

        // Vérifier que l'utilisateur est PF
        if (req.user.role !== "pf") {
            return res.status(403).json({
                message: "Seul un Point Focal peut déclarer une panne"
            });
        }

        // Récupérer département de l'utilisateur
        const [userData] = await db
            .promise()
            .query("SELECT departement_id FROM utilisateurs WHERE id = ?", [req.user.id]);

        if (!userData[0] || !userData[0].departement_id) {
            return res.status(403).json({ message: "Vous n'êtes rattaché à aucun département" });
        }

        const userDepartementId = userData[0].departement_id;

        // Vérifier que l'équipement appartient bien à ce département
        const [equipement] = await db
            .promise()
            .query(
                `SELECT e.id, e.unite_id, u.departement_id 
                 FROM equipements e 
                 JOIN unites u ON e.unite_id = u.id 
                 WHERE e.id = ?`,
                [equipement_id]
            );

        if (equipement.length === 0) {
            return res.status(404).json({ message: "Équipement non trouvé" });
        }

        if (equipement[0].departement_id !== userDepartementId) {
            return res.status(403).json({
                message: "Vous ne pouvez déclarer une panne que pour votre département"
            });
        }

        // Créer la demande de réparation
        db.query(
            `INSERT INTO demandes_reparation (equipement_id, demande_par, description, statut)
             VALUES (?, ?, ?, 'ouvert')`,
            [equipement_id, req.user.id, description],
            (err, result) => {
                if (err) return res.status(500).json({ error: err });
                // Le trigger SQL se charge de mettre l'équipement en 'reparation'
                res.json({ message: "Panne déclarée avec succès", id: result.insertId });
            }
        );
    } catch (error) {
        console.error("Erreur create réparation:", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// ===========================
// MISE À JOUR DU STATUT (ADMIN)
// ===========================
exports.updateStatut = (req, res) => {
    const { id } = req.params;
    const { statut, commentaire_admin, nouvel_etat } = req.body;

    if (!statut) {
        return res.status(400).json({ message: "Le statut est obligatoire" });
    }

    // Mettre à jour la demande de réparation
    const sql = `
        UPDATE demandes_reparation
        SET statut = ?, 
            commentaire_resolution = ?,
            date_resolution = IF(?='termine', NOW(), date_resolution)
        WHERE id = ?
    `;

    db.query(sql, [statut, commentaire_admin || null, statut, id], (err) => {
        if (err) return res.status(500).json({ error: err });

        if (nouvel_etat) {
            // Mettre à jour l'état de l'équipement si fourni
            db.query(
                `UPDATE equipements e
                 JOIN demandes_reparation d ON d.equipement_id = e.id
                 SET e.etat = ?, e.date_maj = NOW()
                 WHERE d.id = ?`,
                [nouvel_etat, id],
                (err2) => {
                    if (err2) console.error("Erreur maj état équipement:", err2);
                    res.json({ message: "Réparation mise à jour avec succès" });
                }
            );
        } else {
            res.json({ message: "Réparation mise à jour avec succès" });
        }
    });
};

// ===========================
// SUPPRESSION (optionnel, admin)
// ===========================
exports.delete = (req, res) => {
    const { id } = req.params;

    db.query("DELETE FROM demandes_reparation WHERE id = ?", [id], (err) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ message: "Demande supprimée" });
    });
};
