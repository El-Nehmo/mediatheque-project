import { prisma } from "./prisma";

export type CrudResult = {
  success: boolean;
  message?: string;
};

export async function getAlbums() {
  try {
    
    const albums = await prisma.albums.findMany();
    
    return albums;
  } catch (err) {
    console.error("Erreur getAlbums (service):", err);
    return [];
  }
}

export async function getExemplairesByAlbum(albumId: number) {
  try {
    
    const all = await prisma.exemplaires.findMany();
    return all.filter((ex: any) => ex.id_album === albumId);
  } catch (err) {
    console.error("Erreur getExemplairesByAlbum (service):", err);
    return [];
  }
}

export async function createAlbum(params: {
  titre: string;
  artiste: string;
  annee_sortie?: number | null;
  maison_disque?: string | null;
}): Promise<CrudResult> {
  try {
    await prisma.albums.create({
      data: {
        titre: params.titre,
        artiste: params.artiste,
        annee_sortie: params.annee_sortie ?? null,
        maison_disque: params.maison_disque ?? null,
        // EAN bidon généré mais toujours via Prisma 
        ean: `${Date.now()}${Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, "0")}`.slice(0, 13),
      },
    });

    return { success: true };
  } catch (err) {
    console.error("Erreur createAlbum (service):", err);
    return {
      success: false,
      message: "Erreur lors de la création de l'album",
    };
  }
}

export async function updateAlbum(params: {
  id_album: number;
  titre: string;
  artiste: string;
  annee_sortie?: number | null;
  maison_disque?: string | null;
}): Promise<CrudResult> {
  try {
    await prisma.albums.update({
      
      where: { id_album: params.id_album },
      data: {
        titre: params.titre,
        artiste: params.artiste,
        annee_sortie: params.annee_sortie ?? null,
        maison_disque: params.maison_disque ?? null,
      },
    });

    return { success: true };
  } catch (err) {
    console.error("Erreur updateAlbum (service):", err);
    return {
      success: false,
      message: "Erreur lors de la mise à jour de l'album",
    };
  }
}

export async function deleteAlbum(id_album: number): Promise<CrudResult> {
  try {
    await prisma.albums.delete({
      
      where: { id_album },
    });

    return { success: true };
  } catch (err: any) {
    console.error("Erreur deleteAlbum (service):", err);
    return {
      success: false,
      message:
        "Impossible de supprimer cet album : il est encore lié à des exemplaires ou des locations.",
    };
  }
}
