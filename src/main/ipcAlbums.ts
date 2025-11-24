import type { IpcMain } from "electron";
import {
  getAlbums,
  getExemplairesByAlbum,
  createAlbum,
  updateAlbum,
  deleteAlbum,
} from "../services/albumService";
import { getCurrentUser, isStaff } from "./session";

export function registerAlbumsIpc(ipcMain: IpcMain) {
  // Lecture accessible à tous les rôles
  ipcMain.handle("get-albums", async () => {
    return getAlbums();
  });

  ipcMain.handle(
    "get-exemplaires-by-album",
    async (_event, albumId: number) => {
      return getExemplairesByAlbum(albumId);
    }
  );

  // CRUD réservé admin/employé
  ipcMain.handle(
    "create-album",
    async (
      _event,
      payload: {
        titre: string;
        artiste: string;
        annee_sortie?: number | null;
        maison_disque?: string | null;
      }
    ) => {
      const user = getCurrentUser();
      if (!isStaff(user)) {
        return {
          success: false,
          message: "Action réservée au personnel (admin ou employé).",
        };
      }
      return createAlbum(payload);
    }
  );

  ipcMain.handle(
    "update-album",
    async (
      _event,
      payload: {
        id_album: number;
        titre: string;
        artiste: string;
        annee_sortie?: number | null;
        maison_disque?: string | null;
      }
    ) => {
      const user = getCurrentUser();
      if (!isStaff(user)) {
        return {
          success: false,
          message: "Action réservée au personnel (admin ou employé).",
        };
      }
      return updateAlbum(payload);
    }
  );

  ipcMain.handle("delete-album", async (_event, id_album: number) => {
    const user = getCurrentUser();
    if (!isStaff(user)) {
      return {
        success: false,
        message: "Action réservée au personnel (admin ou employé).",
      };
    }
    return deleteAlbum(id_album);
  });
}
