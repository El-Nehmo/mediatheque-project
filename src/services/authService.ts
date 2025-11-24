import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export type AuthUserDTO = {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  roleId: number;
  roleName: string;
};

export type AuthResult = {
  success: boolean;
  message?: string;
  user?: AuthUserDTO;
};

export async function login(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const user: any = await prisma.utilisateurs.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        message: "Email ou mot de passe incorrect",
      };
    }

    const role: any = await prisma.roles.findUnique({
      where: { id_role: user.id_role },
    });

    const ok = bcrypt.compareSync(password, user.password_hash);
    if (!ok) {
      return {
        success: false,
        message: "Email ou mot de passe incorrect",
      };
    }

    return {
      success: true,
      user: {
        id: user.id_utilisateur,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        roleId: user.id_role,
        roleName: role?.nom_role ?? "",
      },
    };
  } catch (err) {
    console.error("Erreur login (service):", err);
    return {
      success: false,
      message: "Erreur serveur lors de la connexion",
    };
  }
}

export async function register(params: {
  nom: string;
  prenom: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  const { nom, prenom, email, password } = params;

  try {
    const existing = await prisma.utilisateurs.findUnique({
      where: { email },
    });

    if (existing) {
      return {
        success: false,
        message: "Un utilisateur avec cet email existe déjà",
      };
    }

    const hash = bcrypt.hashSync(password, 10);

    // Client par défaut : id_role = 3 (d'après ta DB)
    const newUser: any = await prisma.utilisateurs.create({
      data: {
        nom,
        prenom,
        email,
        password_hash: hash,
        id_role: 3,
        date_inscription: new Date(),
      },
    });

    const role: any = await prisma.roles.findUnique({
      where: { id_role: newUser.id_role },
    });

    return {
      success: true,
      user: {
        id: newUser.id_utilisateur,
        nom: newUser.nom,
        prenom: newUser.prenom,
        email: newUser.email,
        roleId: newUser.id_role,
        roleName: role?.nom_role ?? "",
      },
    };
  } catch (err) {
    console.error("Erreur register (service):", err);
    return {
      success: false,
      message: "Erreur serveur lors de l'inscription",
    };
  }
}
