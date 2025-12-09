import type { LoginResult, CrudResult } from "./preload";

// Types de données centraux basés sur le schéma Prisma
export type Album = {
  id_album: number;
  titre: string;
  artiste: string;
  annee_sortie: number | null;
  maison_disque: string | null;
};

export type Exemplaire = {
  id_exemplaire: number;
  num_inventaire: string;
  etat: 'Neuf' | 'Bon' | 'Usé' | 'Endommagé';
  statut: 'Disponible' | 'Loué' | 'Reservé' | 'Perdu';
};

declare global {
  interface Window {
    api: {
      // ---------- AUTH ----------
      login(email: string, password: string): Promise<LoginResult>;
      register(data: {
        nom: string;
        prenom: string;
        email: string;
        password: string;
      }): Promise<LoginResult>;
      logout(): Promise<{ success: boolean }>;

      // ---------- ALBUMS / EXEMPLAIRES ----------
      getAlbums(): Promise<Album[]>;
      createAlbum(data: {
        titre: string;
        artiste: string;
        annee_sortie?: number | null;
        maison_disque?: string | null;
      }): Promise<CrudResult>;
      updateAlbum(data: {
        id_album: number;
        titre: string;
        artiste: string;
        annee_sortie?: number | null;
        maison_disque?: string | null;
      }): Promise<CrudResult>;
      deleteAlbum(id_album: number): Promise<CrudResult>;
      getExemplairesByAlbum(albumId: number): Promise<Exemplaire[]>;

      // ---------- RESERVATIONS (CLIENT) ----------
      getMyReservations(): Promise<any[]>;
      createReservation(data: {
        id_exemplaire: number;
      }): Promise<CrudResult>;
      cancelReservation(id_reservation: number): Promise<CrudResult>;
    };
  }
}

export {};
