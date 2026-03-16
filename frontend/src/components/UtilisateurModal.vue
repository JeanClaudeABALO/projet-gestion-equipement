<template>
  <transition name="slide-down">
    <div class="modal-backdrop" @click.self="$emit('close')">
      <div class="modal">
        <h3 class="title">
          {{ isEdit ? "Modifier l'utilisateur" : "Nouvel utilisateur" }}
        </h3>

        <form @submit.prevent="submit">
          <div class="form-group">
            <label class="form-label">Nom complet *</label>
            <input
              v-model="form.nom"
              placeholder="Nom complet"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">Email *</label>
            <input
              v-model="form.email"
              type="email"
              placeholder="email@exemple.com"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label">
              Mot de passe {{ isEdit ? '(laisser vide pour ne pas changer)' : '*' }}
            </label>
            <input
              v-model="form.password"
              type="password"
              :placeholder="isEdit ? 'Nouveau mot de passe' : 'Mot de passe'"
              :required="!isEdit"
            />
          </div>

          <div class="form-group">
            <label class="form-label">Téléphone</label>
            <input
              v-model="form.telephone"
              placeholder="Téléphone (optionnel)"
            />
          </div>

          <!-- Sélection du rôle -->
          <div class="form-group">
            <label class="form-label">Rôle *</label>
            <select v-model="form.role_id" required :disabled="isEdit && isAdminUser">
              <option value="">-- Sélectionner un rôle --</option>
              <option v-if="canCreateAdmin" :value="adminRoleId">Administrateur</option>
              <option :value="pfRoleId">Point Focal</option>
            </select>
            <small v-if="!canCreateAdmin && !isEdit" class="info-text">
              ℹ️ Vous ne pouvez créer que des points focaux.
            </small>
          </div>

          <!-- Sélection du département (obligatoire pour PF) -->
          <div class="form-group">
            <label class="form-label">
              Département 
              <span v-if="form.role_id === pfRoleId">*</span>
              <span v-else>(optionnel)</span>
            </label>
            <select 
              v-model="form.departement_id" 
              :required="form.role_id === pfRoleId"
              :disabled="form.role_id === adminRoleId"
            >
              <option value="">-- Sélectionner un département --</option>
              <option
                v-for="d in departements"
                :key="d.id"
                :value="d.id"
              >
                {{ d.nom }}
              </option>
              <option v-if="departements.length === 0" disabled>
                Aucun département disponible
              </option>
            </select>
            <small v-if="form.role_id === adminRoleId" class="info-text">
              ℹ️ Les administrateurs n'ont pas besoin de département
            </small>
            <small v-if="form.role_id === pfRoleId && departements.length === 0" class="warning-text">
              ⚠️ Tous les départements ont déjà un point focal assigné
            </small>
          </div>

          <div class="actions">
            <button type="button" class="cancel" @click="$emit('close')">
              Annuler
            </button>
            <button type="submit" class="primary">
              {{ isEdit ? "Modifier" : "Créer" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { reactive, computed, watch, ref, onMounted } from "vue";
import api from "../api/axios";

const props = defineProps({
  modelValue: {
    type: Object,
    default: null
  },
  departements: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(["save", "close"]);

const form = reactive({
  nom: "",
  email: "",
  password: "",
  telephone: "",
  departement_id: "",
  role_id: null
});

const isEdit = computed(() => !!props.modelValue?.id);

// Vérifier le rôle de l'utilisateur actuel
const currentUserRole = ref(localStorage.getItem("role") || "");
const canCreateAdmin = computed(() => currentUserRole.value === "super_admin");
const isAdminUser = computed(() => {
  if (!props.modelValue || !adminRoleId.value) return false;
  // Vérifier si l'utilisateur en cours d'édition est un admin
  // On va vérifier via le role_id si c'est l'adminRoleId
  return props.modelValue.role_id === adminRoleId.value;
});

// IDs des rôles (seront chargés depuis l'API)
const adminRoleId = ref(null);
const pfRoleId = ref(null);

// Charger les rôles au montage
onMounted(async () => {
  try {
    const response = await api.get("/roles");
    const roles = response.data;
    const adminRole = roles.find(r => r.code === "admin");
    const pfRole = roles.find(r => r.code === "pf");
    if (adminRole) adminRoleId.value = adminRole.id;
    if (pfRole) pfRoleId.value = pfRole.id;
  } catch (error) {
    console.error("Erreur lors du chargement des rôles:", error);
    // Valeurs par défaut si l'API échoue (selon le schéma SQL)
    adminRoleId.value = 2;
    pfRoleId.value = 3;
  }
});

// Récupérer l'ID du rôle PF depuis l'API ou le définir à 2 (selon votre schéma)
// Pour l'instant, on le définira côté backend, mais on peut aussi le faire ici
watch(
  () => props.modelValue,
  (v) => {
    if (v) {
      Object.assign(form, {
        nom: v.nom || "",
        email: v.email || "",
        password: "", // Ne pas pré-remplir le mot de passe
        telephone: v.telephone || "",
        departement_id: v.departement_id || "",
        role_id: v.role_id || null
      });
    } else {
      Object.assign(form, {
        nom: "",
        email: "",
        password: "",
        telephone: "",
        departement_id: "",
        role_id: null
      });
    }
  },
  { immediate: true }
);

function submit() {
  // Si l'utilisateur est admin (pas super_admin), forcer le rôle à PF
  if (!canCreateAdmin.value && !isEdit.value) {
    form.role_id = pfRoleId.value;
  }
  
  // Valider que le département est fourni pour les PF
  if (form.role_id === pfRoleId.value && !form.departement_id) {
    alert("Un département est obligatoire pour un Point Focal.");
    return;
  }
  
  emit("save", {
    ...form,
    id: props.modelValue?.id
  });
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal {
  background: #fff;
  width: 540px;
  max-width: 90vw;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,.15);
  font-family: 'Inter', 'Segoe UI', 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
}

.title {
  margin-bottom: 24px;
  font-size: 24px;
  font-weight: 700;
  color: #1a202c;
  text-align: center;
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.3px;
}

.form-group {
  margin-bottom: 18px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
  font-family: 'Inter', sans-serif;
}

input,
select {
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 2px solid #e2e8f0;
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

input:focus,
select:focus {
  outline: none;
  border-color: #1a6fd4;
  box-shadow: 0 0 0 3px rgba(26, 111, 212, 0.1);
}

input::placeholder {
  color: #94a3b8;
}

.warning-text {
  display: block;
  margin-top: 6px;
  color: #dc2626;
  font-size: 12px;
  font-weight: 500;
}

.info-text {
  display: block;
  margin-top: 6px;
  color: #0369a1;
  font-size: 12px;
  font-weight: 500;
}

.info-box {
  background: #e0f2fe;
  padding: 12px 14px;
  border-radius: 10px;
  margin-bottom: 18px;
  border: 1px solid #bae6fd;
}

.info-box small {
  color: #0369a1;
  font-size: 13px;
  font-weight: 500;
  font-family: 'Inter', sans-serif;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.cancel {
  background: #f7fafc;
  border: 2px solid #e2e8f0;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  color: #475569;
  transition: all 0.3s ease;
}

.cancel:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.primary {
  background: linear-gradient(135deg, #1a6fd4 0%, #0f4a7a 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(26, 111, 212, 0.2);
}

.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(26, 111, 212, 0.3);
}

.slide-down-enter-active {
  animation: slideDown 0.35s ease-out;
}
.slide-down-leave-active {
  animation: slideUp 0.25s ease-in;
}

@keyframes slideDown {
  from {
    transform: translateY(-60px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-40px);
    opacity: 0;
  }
}
</style>

