# Médiathèque App

Application Electron pour la gestion d'une médiathèque musicale (albums, exemplaires, réservations, utilisateurs).

---

## Fonctionnalités

- Authentification (connexion/inscription)
- Gestion des albums (CRUD, réservé au staff)
- Gestion des exemplaires d'albums
- Réservation d'exemplaires (clients)
- Annulation de réservations
- Vue des réservations personnelles

---

## Technologies utilisées

- **Electron** : Application desktop multiplateforme
- **Vue.js** : Interface utilisateur réactive
- **TypeScript** : Typage statique
- **Prisma** : ORM pour la base de données MySQL
- **MySQL** : Base de données relationnelle
- **Bootstrap** : Design et composants UI
- **Webpack** : Bundling et configuration Electron
- **bcryptjs** : Hash des mots de passe

---

## Architecture

```text
mediatheque-app/
│
├── src/
│   ├── main/                # Processus principal Electron (IPC, session)
│   ├── services/            # Accès aux données via Prisma
│   ├── ui/                  # Hooks Vue pour la logique front
│   ├── renderer.ts          # Point d'entrée Vue
│   ├── preload.ts           # Bridge IPC sécurisé
│   ├── index.html, index.css
│

# Médiathèque App

Application desktop pour gérer une médiathèque musicale : albums, exemplaires, réservations, utilisateurs.

## Ce que fait l'app

- Permet au staff d'ajouter, modifier, supprimer des albums
- Permet aux clients de réserver et annuler des exemplaires
- Gestion des utilisateurs et authentification

## Technologies

- Electron
- Vue.js
- TypeScript
- Prisma (ORM)
- MySQL

## Prérequis

- Node.js (version 18 ou plus)
- MySQL installé (local ou distant)

## Installation

1. Clone le projet :
   ```sh
   git clone <URL_DU_DEPOT>
   cd mediatheque-project/mediatheque-app
   ```

2. Installe les dépendances :
   ```sh
   npm install
   ```

3. Configure la base de données :
   - Crée un fichier `.env` à la racine avec :
     ```env
     DATABASE_URL="mysql://user:password@localhost:3306/mediatheque_db"
     ```

4. Génère le client Prisma :
   ```sh
   npx prisma generate
   ```

5. Applique le schéma à la base :
   ```sh
   npx prisma migrate dev
   ```

## Lancer l'application

```sh
npm start
```

L'application Electron démarre et tu peux l'utiliser !

Dans le dossier mediatheque-app :

npm run start


Electron Forge compile le projet (TypeScript + Webpack),

lance un serveur pour la partie Vue,

puis ouvre automatiquement la fenêtre de l’application desktop “Médiathèque”.

7. Utilisation rapide

Inscription :

Créer un compte via le formulaire d’inscription (vous serez client par défaut).

Connexion :

Se connecter avec l’email et le mot de passe utilisés à l’inscription.

Selon le rôle :

Admin / Employé

Accès au formulaire pour créer / modifier / supprimer des albums.

Liste des albums à gauche, détail + exemplaires à droite.

Client

Voir la liste des albums.

Cliquer sur un album → voir les exemplaires disponibles.

Cliquer sur “Réserver” pour créer une réservation.

Voir la section “Mes réservations”.

Cliquer sur “Annuler” pour annuler une réservation active.
