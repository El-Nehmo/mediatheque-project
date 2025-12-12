<script setup lang="ts">
import { watch, onMounted } from 'vue';
import Login from './components/Login.vue';
import AlbumList from './components/AlbumList.vue';
import { useAuth } from './composables/useAuth';
import { useAlbums } from './composables/useAlbums';
import { useReservations } from './composables/useReservations';

// 1. Récupération de la logique d'Authentification
const auth = useAuth();
const { isLoggedIn, userName, userRole, isStaff, isClient, logout } = auth;

// 2. Récupération de la logique des Albums
const albumLogic = useAlbums();
// On garde ici ce qui sert à la colonne de droite (Exemplaires) et au watcher
const { selectedAlbumId, exemplaires, loadAlbums, resetAlbumsState } = albumLogic;

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
    <!-- On passe tout l'objet auth au composant Login -->
    <Login v-if="!isLoggedIn" :auth="auth" />

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
          <!-- On passe la logique album et le boolean isStaff -->
          <AlbumList :albumLogic="albumLogic" :isStaff="isStaff" />
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