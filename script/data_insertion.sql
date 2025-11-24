USE mediatheque_db;

-- On vide les tables (si elles sont déjà utilisées)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE paiements;
TRUNCATE TABLE locations;
TRUNCATE TABLE reservations;
TRUNCATE TABLE exemplaires;
TRUNCATE TABLE album_categories;
TRUNCATE TABLE categories;
TRUNCATE TABLE albums;
TRUNCATE TABLE utilisateurs;
TRUNCATE TABLE roles;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================
-- ROLES
-- =====================
INSERT INTO roles (id_role, nom_role, description) VALUES
(1, 'Admin',   'Administrateur de la médiathèque'),
(2, 'Employé', 'Employé de la médiathèque'),
(3, 'Client',  'Utilisateur abonné');

-- =====================
-- UTILISATEURS
-- Mot de passe en clair : "mediatheque"
-- Hash bcrypt (cost 10) : $2b$10$HFiOT6dGn56uBAK2OeDlO.5CJNvZHsb1m3kdrOtBwcxKQ/LUPPwDW
-- =====================
INSERT INTO utilisateurs
(id_utilisateur, nom, prenom, email, password_hash, telephone, rue, numero, code_postal, localite, ville, id_role)
VALUES
(1, 'Admin',   'Alice',  'admin@mediatheque.local',
 '$2b$10$HFiOT6dGn56uBAK2OeDlO.5CJNvZHsb1m3kdrOtBwcxKQ/LUPPwDW',
 '0100000000', 'Rue Centrale', '1', '1000', 'Centre-ville', 'Bruxelles', 1),

(2, 'Durand',  'Marc',   'employe@mediatheque.local',
 '$2b$10$HFiOT6dGn56uBAK2OeDlO.5CJNvZHsb1m3kdrOtBwcxKQ/LUPPwDW',
 '0100000001', 'Rue des Employés', '12', '1000', 'Centre-ville', 'Bruxelles', 2),

(3, 'Martin',  'Claire', 'client@mediatheque.local',
 '$2b$10$HFiOT6dGn56uBAK2OeDlO.5CJNvZHsb1m3kdrOtBwcxKQ/LUPPwDW',
 '0100000002', 'Rue des Clients', '5', '6000', 'Charleroi', 'Charleroi', 3);

-- =====================
-- ALBUMS
-- =====================
INSERT INTO albums
(id_album, titre, artiste, maison_disque, annee_sortie, nb_pistes, description, ean)
VALUES
(1, 'Dark Side of the Moon', 'Pink Floyd', 'Harvest', 1973, 10, 'Album rock progressif culte.', '1111111111111'),
(2, 'Thriller',               'Michael Jackson', 'Epic',   1982, 9,  'Album pop le plus vendu.',   '2222222222222'),
(3, 'Kind of Blue',           'Miles Davis',    'Columbia',1959, 5,  'Classique du jazz.',         '3333333333333'),
(4, 'Random Access Memories', 'Daft Punk',      'Columbia',2013, 13, 'Électro / funk moderne.',    '4444444444444'),
(5, 'The Lord of the Rings OST','Howard Shore', 'Reprise', 2001, 18, 'Bande originale épique.',    '5555555555555');

-- =====================
-- CATEGORIES
-- =====================
INSERT INTO categories (id_categorie, nom_categorie) VALUES
(1, 'Rock'),
(2, 'Pop'),
(3, 'Jazz'),
(4, 'Électro'),
(5, 'Bande originale');

-- =====================
-- ALBUM_CATEGORIES (liaisons N-N)
-- =====================
INSERT INTO album_categories (id_categorie, id_album) VALUES
(1, 1), -- Dark Side of the Moon -> Rock
(2, 2), -- Thriller -> Pop
(3, 3), -- Kind of Blue -> Jazz
(4, 4), -- Random Access Memories -> Électro
(5, 5), -- LOTR OST -> BO
(1, 4); -- RAM aussi rock/funk

-- =====================
-- EXEMPLAIRES
-- =====================
INSERT INTO exemplaires
(id_exemplaire, num_inventaire, etat, statut, date_achat, id_album)
VALUES
(1, 'ALB-001-1', 'Neuf', 'Disponible', '2024-01-10', 1),
(2, 'ALB-001-2', 'Bon',  'Disponible', '2023-11-05', 1),

(3, 'ALB-002-1', 'Bon',  'Disponible', '2022-06-15', 2),

(4, 'ALB-003-1', 'Neuf', 'Disponible', '2024-03-20', 3),

(5, 'ALB-004-1', 'Neuf', 'Disponible', '2024-05-01', 4),
(6, 'ALB-004-2', 'Usé',  'Disponible', '2020-09-12', 4),

(7, 'ALB-005-1', 'Bon',  'Disponible', '2021-12-01', 5),
(8, 'ALB-005-2', 'Endommagé', 'Disponible', '2019-04-18', 5);

-- =====================
-- RESERVATIONS
-- =====================
INSERT INTO reservations
(id_reservation, date_debut, date_fin, statut, id_exemplaire, id_utilisateur)
VALUES
(1, '2025-11-20', '2025-11-25', 'Active', 1, 3),
(2, '2025-11-01', '2025-11-05', 'Terminée', 3, 3);

-- =====================
-- LOCATIONS
-- (les triggers mettront à jour les statuts d'exemplaires)
-- =====================
INSERT INTO locations
(id_location, date_location, date_retour_prevue, date_retour_reelle,
 montant_location, penalites_retard, statut, id_utilisateur, id_reservation, id_exemplaire)
VALUES
-- Location en cours (pas encore retournée)
(1, '2025-11-21 10:00:00', '2025-11-28 10:00:00', NULL,
 5.00, 0.00, 'En cours', 3, 1, 1),

-- Location terminée à temps
(2, '2025-11-05 14:00:00', '2025-11-10 14:00:00', '2025-11-10 13:00:00',
 4.00, 0.00, 'Terminée', 3, 2, 3),

-- Location en retard (pénalités calculées par trigger quand date_retour_reelle > date_retour_prevue)
(3, '2025-10-01 09:30:00', '2025-10-08 09:30:00', '2025-10-12 10:00:00',
 6.00, 0.00, 'En retard', 3, NULL, 5);

-- =====================
-- PAIEMENTS
-- =====================
INSERT INTO paiements
(id_paiement, montant, moyen, statut, date_paiement, id_location)
VALUES
(1, 5.00, 'Carte',   'Validé',    '2025-11-21 10:05:00', 1),
(2, 4.00, 'Espèces', 'Validé',    '2025-11-05 14:05:00', 2),
(3, 8.00, 'En ligne','En attente','2025-10-12 11:00:00', 3);