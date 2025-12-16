import { prisma } from "./prisma";

export type ReservationCrudResult = {
  success: boolean;
  message?: string;
};

// Liste toutes les réservations de l'utilisateur connecté
export async function getReservationsForUser(userId: number) {
  try {
    const reservations = await prisma.reservations.findMany({
      where: {
        id_utilisateur: userId,
      },
      include: {
        exemplaires: {
          include: {
            albums: true,
          },
        },
        utilisateurs: true,
      },
    });
    return reservations;
  } catch (err) {
    console.error("Erreur getReservationsForUser (service):", err);
    return [];
  }
}

// Crée une réservation pour un exemplaire donné
export async function createReservationForUser(params: {
  userId: number;
  id_exemplaire: number;
}): Promise<ReservationCrudResult> {
  try {
    const now = new Date();
    const fin = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 jours

    await prisma.reservations.create({
      data: {
        date_debut: now,
        date_fin: fin,
        // Valeur Prisma (enum reservations_statut) = "Active"
        statut: "Active",
        id_exemplaire: params.id_exemplaire,
        id_utilisateur: params.userId,
      },
    });

    return { success: true };
  } catch (err) {
    console.error("Erreur createReservationForUser (service):", err);
    return {
      success: false,
      message: "Erreur lors de la création de la réservation",
    };
  }
}

// Annule la réservation (client sur la sienne, staff sur tout)
export async function cancelReservationForUser(params: {
  userId: number;
  id_reservation: number;
  isStaff: boolean;
}): Promise<ReservationCrudResult> {
  const { userId, id_reservation, isStaff } = params;

  try {
    const existing: any = await prisma.reservations.findUnique({
      where: { id_reservation },
    });

    if (!existing) {
      return { success: false, message: "Réservation introuvable." };
    }

    // Si ce n'est pas du staff, il doit être propriétaire de la réservation
    if (!isStaff && existing.id_utilisateur !== userId) {
      return {
        success: false,
        message: "Vous n'êtes pas autorisé à modifier cette réservation.",
      };
    }

    await prisma.reservations.update({
      where: { id_reservation },
      data: {
        //  valeur de l'ENUM Prisma = "Annul_e" (et pas "Annulée")
        statut: "Annul_e",
      },
    });

    return { success: true };
  } catch (err) {
    console.error("Erreur cancelReservationForUser (service):", err);
    return {
      success: false,
      message: "Erreur lors de l'annulation de la réservation",
    };
  }
}

