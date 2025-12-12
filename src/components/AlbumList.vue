<script setup lang="ts">
// On récupère la logique des albums et le statut staff depuis le parent
const props = defineProps<{
  albumLogic: any;
  isStaff: boolean;
}>();

// On extrait ce dont on a besoin pour l'affichage de la liste et du formulaire
const {
  albums, selectedAlbumId, loadingAlbums,
  formTitre, formArtiste, formAnneeSortie, formMaisonDisque,
  editingAlbumId, crudMessage, crudError, albumFormTitle, albumSubmitLabel,
  selectAlbum, startCreateAlbum, startEditAlbum, submitAlbumForm, deleteAlbum
} = props.albumLogic;
</script>

<template>
  <div>
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
</template>