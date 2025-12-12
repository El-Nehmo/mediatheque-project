<script setup lang="ts">
// On récupère l'objet 'auth' passé par le parent (App.vue)
const props = defineProps<{ auth: any }>();

// On extrait les variables pour pouvoir les utiliser simplement dans le template
// (Vue gère automatiquement les .value ici)
const {
  email, password, loginError, isRegisterMode,
  regNom, regPrenom, regEmail, regPassword, regPasswordConfirm, registerError,
  login, register, switchToLogin, switchToRegister
} = props.auth;
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-md-6">
      <div class="card">
        <div class="card-body">
          <div class="d-flex justify-content-between mb-3">
            <button
              class="btn btn-sm"
              :class="!isRegisterMode ? 'btn-primary' : 'btn-outline-primary'"
              @click="switchToLogin"
            >
              Se connecter
            </button>
            <button
              class="btn btn-sm"
              :class="isRegisterMode ? 'btn-primary' : 'btn-outline-primary'"
              @click="switchToRegister"
            >
              S'inscrire
            </button>
          </div>

          <!-- Formulaire de connexion -->
          <div v-if="!isRegisterMode">
            <h2 class="h4 mb-3">Connexion</h2>
            <div v-if="loginError" class="alert alert-danger">{{ loginError }}</div>

            <div class="mb-3">
              <label class="form-label">Email</label>
              <input v-model="email" type="email" class="form-control" />
            </div>

            <div class="mb-3">
              <label class="form-label">Mot de passe</label>
              <input v-model="password" type="password" class="form-control" />
            </div>

            <button class="btn btn-primary w-100" @click="login">
              Se connecter
            </button>
          </div>

          <!-- Formulaire d'inscription -->
          <div v-else>
            <h2 class="h4 mb-3">Inscription</h2>
            <div v-if="registerError" class="alert alert-danger">{{ registerError }}</div>

            <div class="mb-3">
              <label class="form-label">Prénom</label>
              <input v-model="regPrenom" type="text" class="form-control" />
            </div>

            <div class="mb-3">
              <label class="form-label">Nom</label>
              <input v-model="regNom" type="text" class="form-control" />
            </div>

            <div class="mb-3">
              <label class="form-label">Email</label>
              <input v-model="regEmail" type="email" class="form-control" />
            </div>

            <div class="mb-3">
              <label class="form-label">Mot de passe</label>
              <input v-model="regPassword" type="password" class="form-control" />
            </div>

            <div class="mb-3">
              <label class="form-label">Confirmation du mot de passe</label>
              <input v-model="regPasswordConfirm" type="password" class="form-control" />
            </div>

            <button class="btn btn-success w-100" @click="register">
              Créer mon compte
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>