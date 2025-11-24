-- -----------------------------------------------------
-- Initialisation de l'environnement
-- -----------------------------------------------------
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schéma mediatheque_db
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `mediatheque_db` DEFAULT CHARACTER SET utf8mb4 ;
USE `mediatheque_db` ;

-- -----------------------------------------------------
-- Table `roles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mediatheque_db`.`roles` (
  `id_role` INT NOT NULL AUTO_INCREMENT,
  `nom_role` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) NULL,
  PRIMARY KEY (`id_role`),
  UNIQUE INDEX `nom_role_UNIQUE` (`nom_role` ASC) VISIBLE)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `utilisateurs`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mediatheque_db`.`utilisateurs` (
  `id_utilisateur` INT NOT NULL AUTO_INCREMENT,
  `nom` VARCHAR(100) NOT NULL,
  `prenom` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `telephone` VARCHAR(20) NULL,
  `rue` VARCHAR(100) NULL,
  `numero` VARCHAR(10) NULL,
  `code_postal` VARCHAR(10) NULL,
  `localite` VARCHAR(100) NULL,
  `ville` VARCHAR(100) NULL,
  `date_inscription` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `id_role` INT NOT NULL,
  PRIMARY KEY (`id_utilisateur`),
  UNIQUE INDEX `UQ_email` (`email` ASC) VISIBLE,
  INDEX `fk_utilisateurs_roles_idx` (`id_role` ASC) VISIBLE,
  CONSTRAINT `fk_utilisateurs_roles`
    FOREIGN KEY (`id_role`)
    REFERENCES `mediatheque_db`.`roles` (`id_role`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `albums`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mediatheque_db`.`albums` (
  `id_album` INT NOT NULL AUTO_INCREMENT,
  `titre` VARCHAR(255) NOT NULL,
  `artiste` VARCHAR(255) NOT NULL,
  `maison_disque` VARCHAR(255) NULL,
  `annee_sortie` YEAR NULL,
  `nb_pistes` INT NULL,
  `description` TEXT NULL,
  `ean` VARCHAR(13) NOT NULL,
  PRIMARY KEY (`id_album`),
  UNIQUE INDEX `ean_UNIQUE` (`ean` ASC) VISIBLE)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `categories`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mediatheque_db`.`categories` (
  `id_categorie` INT NOT NULL AUTO_INCREMENT,
  `nom_categorie` VARCHAR(100) NOT NULL,
  PRIMARY KEY (`id_categorie`),
  UNIQUE INDEX `nomCategorie_UNIQUE` (`nom_categorie` ASC) VISIBLE)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `album_categories`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mediatheque_db`.`album_categories` (
  `id_categorie` INT NOT NULL,
  `id_album` INT NOT NULL,
  PRIMARY KEY (`id_categorie`, `id_album`),
  INDEX `fk_album_categories_albums_idx` (`id_album` ASC) VISIBLE,
  CONSTRAINT `fk_album_categories_categories`
    FOREIGN KEY (`id_categorie`)
    REFERENCES `mediatheque_db`.`categories` (`id_categorie`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_album_categories_albums`
    FOREIGN KEY (`id_album`)
    REFERENCES `mediatheque_db`.`albums` (`id_album`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `exemplaires`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mediatheque_db`.`exemplaires` (
  `id_exemplaire` INT NOT NULL AUTO_INCREMENT,
  `num_inventaire` VARCHAR(45) NOT NULL,
  `etat` ENUM('Neuf', 'Bon', 'Usé', 'Endommagé') NOT NULL,
  `statut` ENUM('Disponible', 'Loué', 'Reservé', 'Perdu') NOT NULL,
  `date_achat` DATE NOT NULL,
  `id_album` INT NOT NULL,
  PRIMARY KEY (`id_exemplaire`),
  UNIQUE INDEX `numInventaire_UNIQUE` (`num_inventaire` ASC) VISIBLE,
  INDEX `fk_exemplaires_albums_idx` (`id_album` ASC) VISIBLE,
  CONSTRAINT `fk_exemplaires_albums`
    FOREIGN KEY (`id_album`)
    REFERENCES `mediatheque_db`.`albums` (`id_album`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `reservations`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mediatheque_db`.`reservations` (
  `id_reservation` INT NOT NULL AUTO_INCREMENT,
  `date_debut` DATE NOT NULL,
  `date_fin` DATE NOT NULL,
  `statut` ENUM('Active', 'Annulée', 'Terminée') NOT NULL,
  `id_exemplaire` INT NOT NULL,
  `id_utilisateur` INT NOT NULL,
  PRIMARY KEY (`id_reservation`),
  INDEX `fk_reservations_exemplaires_idx` (`id_exemplaire` ASC) VISIBLE,
  INDEX `fk_reservations_utilisateurs_idx` (`id_utilisateur` ASC) VISIBLE,
  CONSTRAINT `fk_reservations_exemplaires`
    FOREIGN KEY (`id_exemplaire`)
    REFERENCES `mediatheque_db`.`exemplaires` (`id_exemplaire`),
  CONSTRAINT `fk_reservations_utilisateurs`
    FOREIGN KEY (`id_utilisateur`)
    REFERENCES `mediatheque_db`.`utilisateurs` (`id_utilisateur`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `locations`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mediatheque_db`.`locations` (
  `id_location` INT NOT NULL AUTO_INCREMENT,
  `date_location` DATETIME NOT NULL,
  `date_retour_prevue` DATETIME NOT NULL,
  `date_retour_reelle` DATETIME NULL,
  `montant_location` DECIMAL(10,2) NOT NULL,
  `penalites_retard` DECIMAL(10,2) NULL DEFAULT 0.00,
  `statut` ENUM('En cours', 'Terminée', 'En retard') NOT NULL,
  `id_utilisateur` INT NOT NULL,
  `id_reservation` INT NULL,
  `id_exemplaire` INT NOT NULL,
  PRIMARY KEY (`id_location`),
  INDEX `fk_locations_utilisateurs_idx` (`id_utilisateur` ASC) VISIBLE,
  INDEX `fk_locations_reservations_idx` (`id_reservation` ASC) VISIBLE,
  INDEX `fk_locations_exemplaires_idx` (`id_exemplaire` ASC) VISIBLE,
  CONSTRAINT `fk_locations_utilisateurs`
    FOREIGN KEY (`id_utilisateur`)
    REFERENCES `mediatheque_db`.`utilisateurs` (`id_utilisateur`),
  CONSTRAINT `fk_locations_reservations`
    FOREIGN KEY (`id_reservation`)
    REFERENCES `mediatheque_db`.`reservations` (`id_reservation`),
  CONSTRAINT `fk_locations_exemplaires`
    FOREIGN KEY (`id_exemplaire`)
    REFERENCES `mediatheque_db`.`exemplaires` (`id_exemplaire`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `paiements`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `mediatheque_db`.`paiements` (
  `id_paiement` INT NOT NULL AUTO_INCREMENT,
  `montant` DECIMAL(10,2) NOT NULL,
  `moyen` ENUM('Carte', 'Espèces', 'Virement', 'En ligne') NOT NULL,
  `statut` ENUM('Validé', 'En attente', 'Échoué') NOT NULL,
  `date_paiement` DATETIME NOT NULL,
  `id_location` INT NOT NULL,
  PRIMARY KEY (`id_paiement`),
  INDEX `fk_paiements_locations_idx` (`id_location` ASC) VISIBLE,
  CONSTRAINT `fk_paiements_locations`
    FOREIGN KEY (`id_location`)
    REFERENCES `mediatheque_db`.`locations` (`id_location`))
ENGINE = InnoDB;


-- =====================================================================
-- SECTION DES TRIGGERS (DÉCLENCHEURS)
-- =====================================================================

DELIMITER $$

--
-- TRIGGER 1: Se déclenche après la création d'une location pour mettre à jour le statut de l'exemplaire.
--
CREATE TRIGGER `trg_apres_insert_location`
AFTER INSERT ON `locations`
FOR EACH ROW
BEGIN
    UPDATE `exemplaires`
    SET `statut` = 'Loué'
    WHERE `id_exemplaire` = NEW.id_exemplaire;
END$$

CREATE TRIGGER `trg_avant_update_location_penalites`
BEFORE UPDATE ON `locations`
FOR EACH ROW
BEGIN
    
    DECLARE penalite_par_jour DECIMAL(5, 2);
    SET penalite_par_jour = 0.50; 

    -- On calcule les pénalités seulement si la date de retour est renseignée et en retard
    IF NEW.date_retour_reelle IS NOT NULL AND NEW.date_retour_reelle > NEW.date_retour_prevue THEN
        -- Calculer le nombre de jours de retard
        SET @jours_de_retard = DATEDIFF(NEW.date_retour_reelle, NEW.date_retour_prevue);
        
        -- Mettre à jour le montant des pénalités
        SET NEW.penalites_retard = @jours_de_retard * penalite_par_jour;
    END IF;
END$$

CREATE TRIGGER `trg_apres_update_location`
AFTER UPDATE ON `locations`
FOR EACH ROW
BEGIN
    -- On vérifie si la date de retour vient d'être ajoutée (elle était NULL avant)
    IF OLD.date_retour_reelle IS NULL AND NEW.date_retour_reelle IS NOT NULL THEN
        UPDATE `exemplaires`
        SET `statut` = 'Disponible'
        WHERE `id_exemplaire` = NEW.id_exemplaire;
    END IF;
END$$

-- On remet le délimiteur par défaut
DELIMITER ;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;