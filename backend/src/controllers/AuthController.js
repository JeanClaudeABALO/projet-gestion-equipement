const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = async (req, res) => {
    const { email, password, role } = req.body; // role = "admin" ou "pf"

    if (!email || !password || !role) {
        return res.status(400).json({ message: "Email, mot de passe et rôle sont obligatoires" });
    }

    // Vérifier si rôle existe
    const [roleData] = await db
        .promise()
        .query("SELECT id FROM roles WHERE code = ?", [role]);

    if (roleData.length === 0) {
        return res.status(400).json({ message: "Rôle invalide" });
    }

    const role_id = roleData[0].id;

    // Vérifier l'utilisateur
    const [rows] = await db
        .promise()
        .query("SELECT * FROM utilisateurs WHERE email = ? AND role_id = ?", [email, role_id]);

    if (rows.length === 0) {
        return res.status(401).json({ message: "Aucun utilisateur trouvé avec ce rôle" });
    }

    const user = rows[0];

    // Vérifier mot de passe
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(401).json({ message: "Mot de passe incorrect" });
    }

    // Création token
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
            email: user.email
        }
    });
};
