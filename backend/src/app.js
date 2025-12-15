const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const equipRoutes = require("./routes/equipements");
const uniteRoutes = require("./routes/unites");
const deptRoutes = require("./routes/departements");
const equipTypesRoutes = require("./routes/equipements_types");
const usersRoutes = require("./routes/utilisateurs");
const rolesRoutes = require("./routes/roles");
const logsRoutes = require("./routes/logs");
const mouvementsRoutes = require("./routes/mouvements");
const reparationsRoutes = require("./routes/reparations");





const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/equipements", equipRoutes);
app.use("/api/unites", uniteRoutes);
app.use("/api/departements", deptRoutes);
app.use("/api/equipements-types", equipTypesRoutes);
app.use("/api/utilisateurs", usersRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/mouvements", mouvementsRoutes);
app.use("/api/reparations", reparationsRoutes);



app.get("/", (req, res) => {
    res.send("API backend opérationnelle 🚀");
});

module.exports = app;
