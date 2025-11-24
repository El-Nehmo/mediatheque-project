import { createApp, ref, computed } from "vue";
import "bootstrap/dist/css/bootstrap.min.css";

// --- Types locaux (pour matcher ce que renvoient les IPC) ---

type LoginResult = {
  success: boolean;
  message?: string;
  user?: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    roleId: number;
    roleName: string;
  };
};

type CrudResult = {
  success: boolean;
  message?: string;
};

type Album = {
  id_album: number;
  titre: string;
  artiste: string;
  annee_sortie: number | null;
  maison_disque?: string | null;
};

type Exemplaire = {
  id_exemplaire: number;
  num_inventaire: string;
  etat: string;
  statut: string;
};

type Reservation = {
  id_reservation: number;
  id_exemplaire: number;
  date_debut: string;
  date_fin: string;
  statut: string;
};

// ---------------------- useAuth (dans le même fichier) ----------------------

function useAuth() {
  // --- Login ---
  const email = ref("");
  const password = ref("");
  const loginError = ref("");
  const isLoggedIn = ref(false);
  const userName = ref("");
  const userRole = ref("");
  const userRoleId = ref<number | null>(null);

  const isStaff = computed(
    () => userRoleId.value === 1 || userRoleId.value === 2
  );
  const isClient = computed(() => userRoleId.value === 3);

  // --- Inscription ---
  const isRegisterMode = ref(false);
  const regNom = ref("");
  const regPrenom = ref("");
  const regEmail = ref("");
  const regPassword = ref("");
  const regPasswordConfirm = ref("");
  const registerError = ref("");

  const resetAuthState = () => {
    email.value = "";
    password.value = "";
    loginError.value = "";
    isLoggedIn.value = false;
    userName.value = "";
    userRole.value = "";
    userRoleId.value = null;

    isRegisterMode.value = false;
    regNom.value = "";
    regPrenom.value = "";
    regEmail.value = "";
    regPassword.value = "";
    regPasswordConfirm.value = "";
    registerError.value = "";
  };

  const login = async (): Promise<boolean> => {
    loginError.value = "";

    try {
      const result: LoginResult = await window.api.login(
        email.value,
        password.value
      );

      if (!result.success) {
        loginError.value = result.message ?? "Erreur de connexion";
        isLoggedIn.value = false;
        return false;
      }

      if (!result.user) {
        loginError.value = "Réponse invalide du serveur";
        isLoggedIn.value = false;
        return false;
      }

      isLoggedIn.value = true;
      userName.value = `${result.user.prenom} ${result.user.nom}`;
      userRole.value = result.user.roleName || "";
      userRoleId.value = result.user.roleId ?? null;

      return true;
    } catch (err) {
      console.error(err);
      loginError.value = "Erreur technique lors de la connexion";
      isLoggedIn.value = false;
      return false;
    }
  };

  const register = async (): Promise<boolean> => {
    registerError.value = "";

    if (!regNom.value || !regPrenom.value || !regEmail.value || !regPassword.value) {
      registerError.value = "Tous les champs sont obligatoires.";
      return false;
    }

    if (regPassword.value !== regPasswordConfirm.value) {
      registerError.value = "Les mots de passe ne correspondent pas.";
      return false;
    }

    if (regPassword.value.length < 6) {
      registerError.value = "Le mot de passe doit contenir au moins 6 caractères.";
      return false;
    }

    try {
      const result: LoginResult = await window.api.register({
        nom: regNom.value,
        prenom: regPrenom.value,
        email: regEmail.value,
        password: regPassword.value,
      });

      if (!result.success) {
        registerError.value =
          result.message ?? "Erreur lors de l'inscription.";
        return false;
      }

      if (!result.user) {
        registerError.value = "Réponse invalide du serveur.";
        return false;
      }

      isLoggedIn.value = true;
      userName.value = `${result.user.prenom} ${result.user.nom}`;
      userRole.value = result.user.roleName || "";
      userRoleId.value = result.user.roleId ?? null;

      // reset form
      regNom.value = "";
      regPrenom.value = "";
      regEmail.value = "";
      regPassword.value = "";
      regPasswordConfirm.value = "";
      isRegisterMode.value = false;

      return true;
    } catch (err) {
      console.error(err);
      registerError.value = "Erreur technique lors de l'inscription.";
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await window.api.logout();
    } catch (err) {
      console.error(err);
    }
    resetAuthState();
  };

  const switchToRegister = () => {
    isRegisterMode.value = true;
    loginError.value = "";
  };

  const switchToLogin = () => {
    isRegisterMode.value = false;
    registerError.value = "";
  };

  return {
    email,
    password,
    loginError,
    isLoggedIn,
    userName,
    userRole,
    userRoleId,
    isStaff,
    isClient,

    isRegisterMode,
    regNom,
    regPrenom,
    regEmail,
    regPassword,
    regPasswordConfirm,
    registerError,

    login,
    register,
    logout,
    switchToRegister,
    switchToLogin,
    resetAuthState,
  };
}

// ---------------------- useAlbums (dans le même fichier) ----------------------

function useAlbums() {
  const albums = ref<Album[]>([]);
  const selectedAlbumId = ref<number | null>(null);
  const exemplaires = ref<Exemplaire[]>([]);
  const loadingAlbums = ref(false);

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
    loadAlbums,
    selectAlbum,
    startCreateAlbum,
    startEditAlbum,
    submitAlbumForm,
    deleteAlbum,
    resetAlbumsState,
  };
}

// ------------------ useReservations (dans le même fichier) -------------------

function useReservations() {
  const reservations = ref<Reservation[]>([]);
  const reservationsError = ref("");
  const reservationsMessage = ref("");

  const resetReservationsMessages = () => {
    reservationsError.value = "";
    reservationsMessage.value = "";
  };

  const resetReservationsState = () => {
    reservations.value = [];
    resetReservationsMessages();
  };

  const formatReservationStatus = (raw: string): string => {
    switch (raw) {
      case "Annul_e":
        return "Annulée";
      case "Termin_e":
        return "Terminée";
      case "En_retard":
        return "En retard";
      default:
        return raw;
    }
  };

  const loadMyReservations = async () => {
    resetReservationsMessages();
    try {
      const data = await window.api.getMyReservations();
      reservations.value = data;
    } catch (err) {
      console.error("Erreur loadMyReservations:", err);
      reservationsError.value = "Erreur lors du chargement des réservations.";
    }
  };

  const createReservationForExemplaire = async (ex: Exemplaire) => {
    resetReservationsMessages();
    try {
      const result: CrudResult = await window.api.createReservation({
        id_exemplaire: ex.id_exemplaire,
      });
      if (!result.success) {
        reservationsError.value =
          result.message ?? "Erreur lors de la création de la réservation.";
        return;
      }
      reservationsMessage.value = "Réservation créée avec succès.";
      await loadMyReservations();
    } catch (err) {
      console.error("Erreur createReservationForExemplaire:", err);
      reservationsError.value = "Erreur technique lors de la réservation.";
    }
  };

  const cancelReservation = async (id_reservation: number) => {
    resetReservationsMessages();
    const ok = window.confirm("Annuler cette réservation ?");
    if (!ok) return;

    try {
      const result: CrudResult = await window.api.cancelReservation(
        id_reservation
      );
      if (!result.success) {
        reservationsError.value =
          result.message ??
          "Erreur lors de l'annulation de la réservation.";
        return;
      }
      reservationsMessage.value = "Réservation annulée.";
      await loadMyReservations();
    } catch (err) {
      console.error("Erreur cancelReservation:", err);
      reservationsError.value =
        "Erreur technique lors de l'annulation de la réservation.";
    }
  };

  return {
    reservations,
    reservationsError,
    reservationsMessage,
    loadMyReservations,
    createReservationForExemplaire,
    cancelReservation,
    formatReservationStatus,
    resetReservationsState,
    resetReservationsMessages,
  };
}

// --------------------------- Composant racine Vue ---------------------------

const App = {
  setup() {
    const auth = useAuth();
    const albums = useAlbums();
    const reservations = useReservations();

    const handleLogin = async () => {
      const ok = await auth.login();
      if (!ok) return;

      await albums.loadAlbums();

      if (auth.userRoleId.value === 3) {
        await reservations.loadMyReservations();
      }
    };

    const handleRegister = async () => {
      const ok = await auth.register();
      if (!ok) return;

      await albums.loadAlbums();

      if (auth.userRoleId.value === 3) {
        await reservations.loadMyReservations();
      }
    };

    const logoutAll = async () => {
      await auth.logout();
      albums.resetAlbumsState();
      reservations.resetReservationsState();
    };

    return {
      ...auth,
      ...albums,
      ...reservations,
      handleLogin,
      handleRegister,
      logout: logoutAll,
    };
  },

  template: `
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

              <button class="btn btn-primary w-100" @click="handleLogin">
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

              <button class="btn btn-success w-100" @click="handleRegister">
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
                    Réservation #{{ res.id_reservation }} - Exemplaire {{ res.id_exemplaire }}
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
  `,
};

createApp(App).mount("#app");
