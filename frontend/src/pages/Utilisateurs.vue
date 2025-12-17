<template>
  <div class="utilisateurs-page">
    <!-- HEADER -->
    <div class="header-bar">
      <h1>Gestion des Utilisateurs</h1>
      <button class="add-btn" @click="openAdd">
        <span>＋</span> Créer un Point Focal
      </button>
    </div>

    <!-- TABLE CARD -->
    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Email</th>
            <th>Téléphone</th>
            <th>Rôle</th>
            <th>Département</th>
            <th>Statut</th>
            <th class="center">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="u in utilisateurs" :key="u.id">
            <td>{{ u.id }}</td>
            <td class="bold">{{ u.nom }}</td>
            <td>{{ u.email }}</td>
            <td>{{ u.telephone || "-" }}</td>
            <td>
              <span :class="['badge', u.role_nom === 'Administrateur Central' ? 'admin' : 'pf']">
                {{ u.role_nom }}
              </span>
            </td>
            <td>{{ u.departement_nom || "-" }}</td>
            <td>
              <span :class="['status', u.actif ? 'actif' : 'inactif']">
                {{ u.actif ? "Actif" : "Inactif" }}
              </span>
            </td>
            <td class="center">
              <button class="action edit" @click="openEdit(u)" :disabled="u.role_nom === 'Administrateur Central'">
                ✏️
              </button>
              <button 
                class="action delete" 
                @click="remove(u.id)" 
                :disabled="u.role_nom === 'Administrateur Central' || u.id === currentUserId"
              >
                🗑
              </button>
            </td>
          </tr>

          <tr v-if="utilisateurs.length === 0">
            <td colspan="8" class="empty">Aucun utilisateur enregistré</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL -->
    <UtilisateurModal
      v-if="showModal"
      :modelValue="selected"
      :departements="departements"
      @close="showModal = false"
      @save="saveUtilisateur"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import utilisateursApi from "../api/utilisateurs";
import departementsApi from "../api/departement";
import UtilisateurModal from "../components/UtilisateurModal.vue";
import api from "../api/axios";

const utilisateurs = ref([]);
const departements = ref([]);
const showModal = ref(false);
const selected = ref(null);
const currentUserId = ref(null);

async function loadData() {
  try {
    // Charger les utilisateurs
    const u = await utilisateursApi.getAll();
    utilisateurs.value = u.data || [];

    // Charger les départements pour le formulaire
    const d = await departementsApi.getAll();
    departements.value = d.data || [];

    // Récupérer l'ID de l'utilisateur actuel depuis le token
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        currentUserId.value = payload.id;
      } catch (e) {
        console.error("Erreur décodage token:", e);
      }
    }
  } catch (error) {
    console.error("Erreur lors du chargement:", error);
    if (error.response?.status === 403) {
      alert("Accès refusé. Seul un administrateur peut gérer les utilisateurs.");
    } else {
      alert("Erreur lors du chargement des données.");
    }
  }
}

function openAdd() {
  selected.value = null;
  showModal.value = true;
}

function openEdit(u) {
  // Ne pas permettre la modification de l'admin
  if (u.role_nom === "Administrateur Central") {
    alert("L'administrateur principal ne peut pas être modifié depuis cette interface.");
    return;
  }
  selected.value = u;
  showModal.value = true;
}

async function saveUtilisateur(data) {
  try {
    if (data.id) {
      await utilisateursApi.update(data.id, data);
    } else {
      await utilisateursApi.create(data);
    }
    showModal.value = false;
    await loadData();
  } catch (error) {
    console.error("Erreur lors de l'enregistrement:", error);
    if (error.response?.status === 403) {
      alert("Accès refusé. Seul un administrateur peut créer des utilisateurs.");
    } else if (error.response?.status === 400) {
      alert(error.response.data.message || "Données invalides.");
    } else {
      alert("Erreur lors de l'enregistrement de l'utilisateur.");
    }
  }
}

async function remove(id) {
  const user = utilisateurs.value.find(u => u.id === id);
  if (user && user.role_nom === "Administrateur Central") {
    alert("L'administrateur principal ne peut pas être supprimé.");
    return;
  }

  if (confirm(`Supprimer l'utilisateur "${user?.nom}" ?`)) {
    try {
      await utilisateursApi.remove(id);
      await loadData();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression de l'utilisateur.");
    }
  }
}

onMounted(loadData);
</script>

<style scoped>
.utilisateurs-page {
  padding: 30px;
  background: #eef2f7;
  min-height: 100vh;
}

.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.add-btn {
  background: #16a34a;
  color: white;
  border: none;
  padding: 12px 22px;
  border-radius: 10px;
  font-weight: bold;
  display: flex;
  gap: 10px;
  cursor: pointer;
}

.table-card {
  background: white;
  border-radius: 14px;
  box-shadow: 0 12px 25px rgba(0,0,0,0.08);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: linear-gradient(90deg, #0a5bc4, #09315c);
}

thead th {
  color: white;
  padding: 14px;
  text-align: left;
}

tbody td {
  padding: 14px;
  border-bottom: 1px solid #eee;
}

.bold { font-weight: 600; }
.center { text-align: center; }

.badge {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.badge.admin {
  background: #fbbf24;
  color: #78350f;
}

.badge.pf {
  background: #3b82f6;
  color: white;
}

.status {
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.status.actif {
  background: #d1fae5;
  color: #065f46;
}

.status.inactif {
  background: #fee2e2;
  color: #991b1b;
}

.action {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  margin: 0 4px;
}

.action:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.empty {
  text-align: center;
  padding: 30px;
  color: #999;
}
</style>

