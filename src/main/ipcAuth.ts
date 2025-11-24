// src/main/ipcAuth.ts
import type { IpcMain } from "electron";
import { login, register } from "../services/authService";
import {
  setCurrentUser,
  clearCurrentUser,
} from "./session";

export function registerAuthIpc(ipcMain: IpcMain) {
  ipcMain.handle(
    "login",
    async (
      _event,
      { email, password }: { email: string; password: string }
    ) => {
      const result = await login(email, password);

      if (result.success && result.user) {
        setCurrentUser({
          id: result.user.id,
          roleId: result.user.roleId,
          roleName: result.user.roleName,
          email: result.user.email,
        });
      } else {
        clearCurrentUser();
      }

      return result;
    }
  );

  ipcMain.handle(
    "register",
    async (
      _event,
      payload: { nom: string; prenom: string; email: string; password: string }
    ) => {
      const result = await register(payload);

      if (result.success && result.user) {
        setCurrentUser({
          id: result.user.id,
          roleId: result.user.roleId,
          roleName: result.user.roleName,
          email: result.user.email,
        });
      } else {
        clearCurrentUser();
      }

      return result;
    }
  );

  ipcMain.handle("logout", async () => {
    clearCurrentUser();
    return { success: true };
  });
}
