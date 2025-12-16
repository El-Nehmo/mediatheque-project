# Médiathèque App

Application Desktop pour la gestion d'une médiathèque musicale (albums, exemplaires, réservations, utilisateurs), construite avec **Electron**, **Vue.js** et **TypeScript**.

---

## Fonctionnalités

- **Authentification** : Système de connexion et d'inscription sécurisé (hashage bcrypt).
- **Rôles** : Distinction entre l'interface **Client** et **Staff** (Admin/Employé).
- **Gestion des Albums (Staff)** : Ajout, modification et suppression (CRUD).
- **Gestion des Exemplaires** : Suivi des copies physiques liées aux albums.
- **Réservations (Clients)** : Emprunt d'exemplaires disponibles, annulation et suivi via un tableau de bord personnel.

---

## Architecture Technique

- **Electron** : Application desktop multiplateforme.
- **Vue.js 3** : Interface utilisateur réactive.
- **TypeScript** : Langage typé pour la robustesse.
- **Prisma** : ORM moderne pour l'accès aux données.
- **Base de données** : Compatible MySQL ou PostgreSQL.
- **Bootstrap 5** : Design et composants UI.

### Structure du projet

```text
mediatheque-app/
│
├── src/
│   ├── main/          # Processus Principal (Backend Electron, IPC, Session)
│   ├── services/      # Logique métier et accès BDD (Prisma)
│   ├── composables/   # Logique réactive (Hooks Vue)
│   ├── components/    # Composants Vue (UI)
│   ├── renderer.ts    # Point d'entrée Vue
│   ├── preload.ts     # Bridge sécurisé IPC
│   └── ...

```

---

##Prérequis* **Node.js** (version 18 ou supérieure)
* **Base de données** : MySQL ou PostgreSQL installé localement ou accessible à distance.

---

##Installation1. **Cloner le projet :**
```bash
git clone <URL_DU_DEPOT>
cd mediatheque-project/mediatheque-app

```


2. **Installer les dépendances :**
```bash
npm install

```


3. **Configurer la base de données :**
Créez un fichier `.env` à la racine du projet. Copiez l'une des lignes suivantes selon votre base de données :
*Pour MySQL :*
```env
DATABASE_URL="mysql://user:password@localhost:3306/mediatheque_db"

```


*Pour PostgreSQL :*
```env
DATABASE_URL="postgresql://user:password@localhost:5432/mediatheque_db"

```


*(Pensez à adapter `user`, `password` et le nom de la base `mediatheque_db` selon votre configuration)*.
> **Note** : Si vous passez de MySQL à PostgreSQL (ou inversement), vérifiez que le `provider` dans votre fichier `prisma/schema.prisma` correspond bien (`provider = "mysql"` ou `provider = "postgresql"`).


4. **Initialiser la base de données (Prisma) :**
Générez le client et créez les tables :
```bash
npx prisma generate
npx prisma migrate dev

```



---

##Lancer l'applicationPour démarrer l'application en mode développement :

```bash
npm start

```

Cela va compiler le projet (TypeScript + Webpack), lancer le serveur Vue, et ouvrir la fenêtre Electron.

---

##Guide d'utilisation rapide1. **Inscription** : Créez un premier compte via le formulaire. Par défaut, ce compte aura le rôle **Client** (si créé après avoir inséré le script data_insetion.sql dans le dossier script si pas aura le rôle **admin** pour l'id 1 (id 2 = staff et àpd de 3 client)).
2. **Connexion** : Connectez-vous avec vos identifiants.

###Selon votre rôle :* **Staff (Admin / Employé)** :
* Vous avez accès aux outils d'édition.
* Sélectionnez un album dans la liste pour voir ses détails, modifier ses infos ou le supprimer.


* **Client** :
* Parcourez la liste des albums.
* Cliquez sur un album pour voir les exemplaires disponibles.
* Cliquez sur **"Réserver"** pour mettre un exemplaire de côté.
* Consultez et annulez vos réservations dans la section "Mes réservations".



```

```