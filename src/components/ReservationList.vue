<script setup lang="ts">
const props = defineProps<{
  reservationLogic: any;
}>();

const {
  reservations, reservationsError, reservationsMessage,
  formatReservationStatus, cancelReservation
} = props.reservationLogic;
</script>

<template>
  <div class="mt-4">
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
</template>