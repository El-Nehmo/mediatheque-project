import { contextBridge, ipcRenderer } from "electron";

export type LoginResult = {
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

export type CrudResult = {
  success: boolean;
  message?: string;
};

contextBridge.exposeInMainWorld("api", {
  // ---------- AUTH ----------
  login: (email: string, password: string): Promise<LoginResult> =>
    ipcRenderer.invoke("login", { email, password }),

  register: (data: {
    nom: string;
    prenom: string;
    email: string;
    password: string;
  }): Promise<LoginResult> => ipcRenderer.invoke("register", data),

  logout: (): Promise<{ success: boolean }> => ipcRenderer.invoke("logout"),

  // ---------- ALBUMS / EXEMPLAIRES ----------
  getAlbums: (): Promise<any[]> => ipcRenderer.invoke("get-albums"),

  createAlbum: (data: {
    titre: string;
    artiste: string;
    annee_sortie?: number | null;
    maison_disque?: string | null;
  }): Promise<CrudResult> => ipcRenderer.invoke("create-album", data),

  updateAlbum: (data: {
    id_album: number;
    titre: string;
    artiste: string;
    annee_sortie?: number | null;
    maison_disque?: string | null;
  }): Promise<CrudResult> => ipcRenderer.invoke("update-album", data),

  deleteAlbum: (id_album: number): Promise<CrudResult> =>
    ipcRenderer.invoke("delete-album", id_album),

  getExemplairesByAlbum: (albumId: number): Promise<any[]> =>
    ipcRenderer.invoke("get-exemplaires-by-album", albumId),

  // ---------- RESERVATIONS (CLIENT) ----------
  getMyReservations: (): Promise<any[]> =>
    ipcRenderer.invoke("get-my-reservations"),

  createReservation: (data: {
    id_exemplaire: number;
  }): Promise<CrudResult> => ipcRenderer.invoke("create-reservation", data),

  cancelReservation: (id_reservation: number): Promise<CrudResult> =>
    ipcRenderer.invoke("cancel-reservation", id_reservation),
});

