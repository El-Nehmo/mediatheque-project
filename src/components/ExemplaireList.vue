<script setup lang="ts">
defineProps<{
  exemplaires: any[];
  isClient: boolean;
  createReservation: (ex: any) => void;
}>();
</script>

<template>
  <div>
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
            @click.stop="createReservation(ex)"
          >
            Réserver
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>