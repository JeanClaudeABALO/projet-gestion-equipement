const jwt = require("jsonwebtoken");

/**
 * Vérifie le JWT (synchrone) avec une petite tolérance d’horloge (serveurs désynchronisés).
 * Réponses normalisées pour que le frontend puisse distinguer expiration vs autres erreurs.
 */
module.exports = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
        return res.status(403).json({ message: "Token requis", code: "NO_TOKEN" });
    }

    const token = header.split(" ")[1];
    if (!token || token === "undefined" || token === "null") {
        return res.status(403).json({ message: "Token requis", code: "NO_TOKEN" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
            clockTolerance: 60,
        });
        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Session expirée. Veuillez vous reconnecter.",
                code: "TOKEN_EXPIRED",
            });
        }
        return res.status(401).json({
            message: "Token invalide. Veuillez vous reconnecter.",
            code: "INVALID_TOKEN",
        });
    }
};
