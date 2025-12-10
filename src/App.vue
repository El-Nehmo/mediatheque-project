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
  <!-- 
    C'est ici que nous allons coller tout le HTML (le contenu du `template`) 
    qui se trouve actuellement dans votre fichier renderer.ts.
  -->
  <div style="padding: 20px; font-family: sans-serif;">
    <h1>App.vue est prêt !</h1>
    <p>Prochaine étape : Copier le HTML de renderer.ts ici.</p>
  </div>
</template>

<style>
/* Ici, nous pourrons mettre du CSS global si besoin */
</style>