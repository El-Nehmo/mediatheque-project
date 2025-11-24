import { ref } from "vue";
import type { CrudResult } from "../preload";
import type { Exemplaire } from "./useAlbums";

export type Reservation = {
  id_reservation: number;
  id_exemplaire: number;
  date_debut: string;
  date_fin: string;
  statut: string;
};

export function useReservations() {
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

  // Helper pour rendre les statuts jolis (Annul_e -> Annulée, etc.)
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
    // state
    reservations,
    reservationsError,
    reservationsMessage,

    // actions
    loadMyReservations,
    createReservationForExemplaire,
    cancelReservation,

    // helpers
    formatReservationStatus,
    resetReservationsState,
    resetReservationsMessages,
  };
}
