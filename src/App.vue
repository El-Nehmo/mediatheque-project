<script setup lang="ts">
import { watch, onMounted } from 'vue';
import Login from './components/Login.vue';
import AlbumList from './components/AlbumList.vue';
import ExemplaireList from './components/ExemplaireList.vue';
import ReservationList from './components/ReservationList.vue';
import { useAuth } from './composables/useAuth';
import { useAlbums } from './composables/useAlbums';
import { useReservations } from './composables/useReservations';

// 1. Récupération de la logique d'Authentification
const auth = useAuth();
const { isLoggedIn, userName, userRole, isStaff, isClient, logout } = auth;

// 2. Récupération de la logique des Albums
const albumLogic = useAlbums();

const { selectedAlbumId, exemplaires, loadAlbums, resetAlbumsState } = albumLogic;

// 3. Récupération de la logique des Réservations
const reservationLogic = useReservations();
const {
  loadMyReservations, createReservationForExemplaire, resetReservationsState
} = reservationLogic;

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
          <AlbumList :albumLogic="albumLogic" :isStaff="isStaff" />
        </div>

        <div class="col-md-6" v-if="selectedAlbumId">
          <ExemplaireList
            :exemplaires="exemplaires"
            :isClient="isClient"
            :createReservation="createReservationForExemplaire"
          />

          <!-- Mes réservations (client) -->
          <ReservationList
            v-if="isClient"
            :reservationLogic="reservationLogic"
          />
        </div>
      </div>
    </div>
  </div>
</template>