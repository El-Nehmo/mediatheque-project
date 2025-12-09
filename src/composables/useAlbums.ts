import { ref, computed } from "vue";
import type { CrudResult } from "../preload";
import type { Album, Exemplaire } from "../global";

export function useAlbums() {
  // --- état principal ---
  const albums = ref<Album[]>([]);
  const selectedAlbumId = ref<number | null>(null);
  const exemplaires = ref<Exemplaire[]>([]);
  const loadingAlbums = ref(false);

  // --- formulaire CRUD ---
  const formTitre = ref("");
  const formArtiste = ref("");
  const formAnneeSortie = ref("");
  const formMaisonDisque = ref("");
  const editingAlbumId = ref<number | null>(null);
  const crudMessage = ref("");
  const crudError = ref("");

  const albumFormTitle = computed(() =>
    editingAlbumId.value === null ? "Créer un album" : "Modifier l'album"
  );

  const albumSubmitLabel = computed(() =>
    editingAlbumId.value === null ? "Créer" : "Enregistrer"
  );

  const resetAlbumForm = () => {
    formTitre.value = "";
    formArtiste.value = "";
    formAnneeSortie.value = "";
    formMaisonDisque.value = "";
    editingAlbumId.value = null;
    crudError.value = "";
    crudMessage.value = "";
  };

  const resetAlbumsState = () => {
    albums.value = [];
    selectedAlbumId.value = null;
    exemplaires.value = [];
    loadingAlbums.value = false;
    resetAlbumForm();
  };

  // ---------- DATA ALBUMS/EXEMPLAIRES ----------

  const loadAlbums = async () => {
    loadingAlbums.value = true;
    crudError.value = "";
    crudMessage.value = "";

    try {
      const data = await window.api.getAlbums();
      albums.value = data;
    } catch (err) {
      console.error("Erreur loadAlbums:", err);
      crudError.value = "Erreur lors du chargement des albums.";
    } finally {
      loadingAlbums.value = false;
    }
  };

  const selectAlbum = async (albumId: number) => {
    selectedAlbumId.value = albumId;
    exemplaires.value = [];
    try {
      const data = await window.api.getExemplairesByAlbum(albumId);
      exemplaires.value = data;
    } catch (err) {
      console.error("Erreur selectAlbum/getExemplairesByAlbum:", err);
    }
  };

  // ---------- CRUD ALBUMS (staff) ----------

  const startCreateAlbum = () => {
    resetAlbumForm();
  };

  const startEditAlbum = (album: Album) => {
    editingAlbumId.value = album.id_album;
    formTitre.value = album.titre;
    formArtiste.value = album.artiste;
    formAnneeSortie.value = album.annee_sortie ? String(album.annee_sortie) : "";
    formMaisonDisque.value = album.maison_disque ?? "";
    crudError.value = "";
    crudMessage.value = "";
  };

  const submitAlbumForm = async () => {
    crudError.value = "";
    crudMessage.value = "";

    if (!formTitre.value.trim() || !formArtiste.value.trim()) {
      crudError.value = "Titre et artiste sont obligatoires.";
      return;
    }

    let annee: number | null = null;
    if (formAnneeSortie.value.trim() !== "") {
      const parsed = parseInt(formAnneeSortie.value.trim(), 10);
      if (Number.isNaN(parsed)) {
        crudError.value = "L'année de sortie doit être un nombre.";
        return;
      }
      annee = parsed;
    }

    const payload = {
      titre: formTitre.value.trim(),
      artiste: formArtiste.value.trim(),
      annee_sortie: annee,
      maison_disque: formMaisonDisque.value.trim() || null,
    };

    try {
      let result: CrudResult;

      if (editingAlbumId.value === null) {
        result = await window.api.createAlbum(payload);
        if (!result.success) {
          crudError.value =
            result.message ?? "Erreur lors de la création de l'album.";
          return;
        }
        crudMessage.value = "Album créé avec succès.";
      } else {
        result = await window.api.updateAlbum({
          id_album: editingAlbumId.value,
          ...payload,
        });
        if (!result.success) {
          crudError.value =
            result.message ?? "Erreur lors de la mise à jour de l'album.";
          return;
        }
        crudMessage.value = "Album mis à jour avec succès.";
      }

      await loadAlbums();
      resetAlbumForm();
    } catch (err) {
      console.error("Erreur submitAlbumForm:", err);
      crudError.value = "Erreur technique lors de l'enregistrement de l'album.";
    }
  };

  const deleteAlbum = async (album: Album) => {
    crudError.value = "";
    crudMessage.value = "";

    const confirmDelete = window.confirm(
      `Supprimer l'album "${album.titre}" ?`
    );
    if (!confirmDelete) return;

    try {
      const result: CrudResult = await window.api.deleteAlbum(album.id_album);
      if (!result.success) {
        crudError.value =
          result.message ??
          "Impossible de supprimer cet album (il est peut-être lié à des exemplaires).";
        return;
      }

      crudMessage.value = "Album supprimé avec succès.";
      if (selectedAlbumId.value === album.id_album) {
        selectedAlbumId.value = null;
        exemplaires.value = [];
      }
      await loadAlbums();
    } catch (err) {
      console.error("Erreur deleteAlbum:", err);
      crudError.value = "Erreur technique lors de la suppression de l'album.";
    }
  };

  return {
    // state
    albums,
    selectedAlbumId,
    exemplaires,
    loadingAlbums,

    formTitre,
    formArtiste,
    formAnneeSortie,
    formMaisonDisque,
    editingAlbumId,
    crudMessage,
    crudError,
    albumFormTitle,
    albumSubmitLabel,

    // actions
    loadAlbums,
    selectAlbum,
    startCreateAlbum,
    startEditAlbum,
    submitAlbumForm,
    deleteAlbum,

    // util
    resetAlbumsState,
  };
}
