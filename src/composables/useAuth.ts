import { ref, computed } from "vue";
import type { LoginResult } from "../preload";

export function useAuth() {
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

  // ---------- ACTIONS ----------

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

      // on reset le formulaire d'inscription
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
      // même si l’IPC échoue, on nettoie quand même le front
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
    // state login
    email,
    password,
    loginError,
    isLoggedIn,
    userName,
    userRole,
    userRoleId,
    isStaff,
    isClient,

    // state register
    isRegisterMode,
    regNom,
    regPrenom,
    regEmail,
    regPassword,
    regPasswordConfirm,
    registerError,

    // actions
    login,
    register,
    logout,
    switchToRegister,
    switchToLogin,

    // util
    resetAuthState,
  };
}
