<script setup lang="ts">
import { watch, onMounted } from 'vue';
import { useAuth } from './composables/useAuth';
import { useAlbums } from './composables/useAlbums';
import { useReservations } from './composables/useReservations';

// 1. Récupération de la logique d'Authentification
const {
  email, password, loginError, isLoggedIn, userName, userRole, isStaff, isClient,
  isRegisterMode, regNom, regPrenom, regEmail, regPassword, regPasswordConfirm, registerError,
  login, register, logout, switchToRegister, switchToLogin
} = useAuth();

// 2. Récupération de la logique des Albums
const {
  albums, selectedAlbumId, exemplaires, loadingAlbums,
  formTitre, formArtiste, formAnneeSortie, formMaisonDisque, editingAlbumId, crudMessage, crudError, albumFormTitle, albumSubmitLabel,
  loadAlbums, selectAlbum, startCreateAlbum, startEditAlbum, submitAlbumForm, deleteAlbum, resetAlbumsState
} = useAlbums();

// 3. Récupération de la logique des Réservations
const {
  reservations, reservationsError, reservationsMessage,
  loadMyReservations, createReservationForExemplaire, cancelReservation, formatReservationStatus, resetReservationsState
} = useReservations();

// --- Logique de liaison ---

// Quand l'utilisateur se connecte ou se déconnecte
watch(isLoggedIn, (connected) => {
  if (connected) {
    // Si connecté, on charge les données
    loadAlbums();
    if (isClient.value) {
      loadMyReservations();
    }
  } else {
    // Si déconnecté, on nettoie tout
    resetAlbumsState();
    resetReservationsState();
  }
});
</script>

<template>
  <div class="container py-4">
    <h1 class="mb-4">Médiathèque</h1>

    <!-- AUTH -->
    <div v-if="!isLoggedIn" class="row justify-content-center">
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

    <!-- APP -->
    <div v-else>
      <div class="mb-3 d-flex justify-content-between align-items-center">
        <div>
          Connecté en tant que
          <strong>{{ userName }}</strong>
          <span v-if="userRole" class="badge bg-info text-dark ms-2">
            {{ userRole }}
          </span>
        </div>
        <button class="btn btn-outline-secondary btn-sm" @click="logout">
          Se déconnecter
        </button>
      </div>

      <div class="row">
        <div class="col-md-6">
          <h2 class="h5">Albums</h2>

          <!-- Formulaire CRUD album (admin/employé uniquement) -->
          <div class="card mb-3" v-if="isStaff">
            <div class="card-body">
              <h3 class="h6 mb-3">
                {{ albumFormTitle }}
              </h3>

              <div v-if="crudError" class="alert alert-danger">{{ crudError }}</div>
              <div v-if="crudMessage" class="alert alert-success">{{ crudMessage }}</div>

              <div class="mb-2">
                <label class="form-label">Titre</label>
                <input v-model="formTitre" type="text" class="form-control" />
              </div>

              <div class="mb-2">
                <label class="form-label">Artiste</label>
                <input v-model="formArtiste" type="text" class="form-control" />
              </div>

              <div class="mb-2">
                <label class="form-label">Année de sortie</label>
                <input v-model="formAnneeSortie" type="text" class="form-control" placeholder="Optionnel" />
              </div>

              <div class="mb-2">
                <label class="form-label">Maison de disque</label>
                <input v-model="formMaisonDisque" type="text" class="form-control" placeholder="Optionnel" />
              </div>

              <div class="d-flex justify-content-between mt-2">
                <button class="btn btn-primary" @click="submitAlbumForm">
                  {{ albumSubmitLabel }}
                </button>
                <button
                  v-if="editingAlbumId !== null"
                  class="btn btn-outline-secondary"
                  @click="startCreateAlbum"
                >
                  Annuler la modification
                </button>
              </div>
            </div>
          </div>

          <div v-if="loadingAlbums">Chargement des albums...</div>
          <ul class="list-group">
            <li
              v-for="album in albums"
              :key="album.id_album"
              class="list-group-item d-flex justify-content-between align-items-center"
              :class="{ active: album.id_album === selectedAlbumId }"
            >
              <div @click="selectAlbum(album.id_album)" style="cursor: pointer;">
                <div class="fw-bold">{{ album.titre }}</div>
                <div class="small text-muted">{{ album.artiste }}</div>
              </div>
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-secondary" v-if="album.annee_sortie">
                  {{ album.annee_sortie }}
                </span>
                <button
                  v-if="isStaff"
                  class="btn btn-sm btn-outline-primary"
                  @click.stop="startEditAlbum(album)"
                >
                  Modifier
                </button>
                <button
                  v-if="isStaff"
                  class="btn btn-sm btn-outline-danger"
                  @click.stop="deleteAlbum(album)"
                >
                  Supprimer
                </button>
              </div>
            </li>
          </ul>
        </div>

        <div class="col-md-6" v-if="selectedAlbumId">
          <h2 class="h5">Exemplaires</h2>
          <div v-if="exemplaires.length === 0">
            Aucun exemplaire pour cet album.
          </div>
          <ul class="list-group" v-else>
            <li
              v-for="ex in exemplaires"
              :key="ex.id_exemplaire"
              class="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <div class="fw-bold">#{{ ex.num_inventaire }}</div>
                <div class="small text-muted">État : {{ ex.etat }}</div>
              </div>
              <div class="d-flex align-items-center gap-2">
                <span
                  class="badge"
                  :class="{
                    'bg-success': ex.statut === 'Disponible',
                    'bg-warning text-dark': ex.statut === 'Loué' || ex.statut === 'Reservé',
                    'bg-danger': ex.statut === 'Perdu'
                  }"
                >
                  {{ ex.statut }}
                </span>
                <button
                  v-if="isClient && ex.statut === 'Disponible'"
                  class="btn btn-sm btn-outline-primary"
                  @click.stop="createReservationForExemplaire(ex)"
                >
                  Réserver
                </button>
              </div>
            </li>
          </ul>

          <!-- Mes réservations (client) -->
          <div v-if="isClient" class="mt-4">
            <h2 class="h5">Mes réservations</h2>
            <div v-if="reservationsError" class="alert alert-danger">{{ reservationsError }}</div>
            <div v-if="reservationsMessage" class="alert alert-success">{{ reservationsMessage }}</div>
            <div v-if="reservations.length === 0">
              Aucune réservation pour le moment.
            </div>
            <ul class="list-group" v-else>
              <li
                v-for="res in reservations"
                :key="res.id_reservation"
                class="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  <div class="fw-bold">
                    Réservation #{{ res.id_reservation }} - {{ res.exemplaires.albums.titre }}
                  </div>
                  <div class="small text-muted">
                    Du {{ new Date(res.date_debut).toLocaleDateString() }}
                    au {{ new Date(res.date_fin).toLocaleDateString() }}
                  </div>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <span class="badge"
                    :class="{
                      'bg-success': res.statut === 'Active',
                      'bg-secondary': res.statut === 'Termin_e',
                      'bg-warning text-dark': res.statut === 'En_retard',
                      'bg-danger': res.statut === 'Annul_e'
                    }"
                  >
                    {{ formatReservationStatus(res.statut) }}
                  </span>
                  <button
                    v-if="res.statut === 'Active'"
                    class="btn btn-sm btn-outline-danger"
                    @click="cancelReservation(res.id_reservation)"
                  >
                    Annuler
                  </button>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>