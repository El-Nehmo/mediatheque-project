import type { IpcMain } from "electron";
import {
  getReservationsForUser,
  createReservationForUser,
  cancelReservationForUser,
} from "../services/reservationService";
import {
  getCurrentUser,
  isClient,
  isStaff,
} from "./session";

export function registerReservationsIpc(ipcMain: IpcMain) {
  ipcMain.handle("get-my-reservations", async () => {
    const user = getCurrentUser();
    if (!user) {
      return [];
    }
    return getReservationsForUser(user.id);
  });

  ipcMain.handle(
    "create-reservation",
    async (_event, payload: { id_exemplaire: number }) => {
      const user = getCurrentUser();
      if (!user) {
        return { success: false, message: "Vous devez être connecté." };
      }
      if (!isClient(user)) {
        return {
          success: false,
          message: "Cette action est réservée aux clients.",
        };
      }

      return createReservationForUser({
        userId: user.id,
        id_exemplaire: payload.id_exemplaire,
      });
    }
  );

  ipcMain.handle(
    "cancel-reservation",
    async (_event, id_reservation: number) => {
      const user = getCurrentUser();
      if (!user) {
        return { success: false, message: "Vous devez être connecté." };
      }

      return cancelReservationForUser({
        userId: user.id,
        id_reservation,
        isStaff: isStaff(user),
      });
    }
  );
}

