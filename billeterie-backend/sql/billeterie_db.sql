-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : lun. 02 juin 2025 à 21:20
-- Version du serveur : 8.0.31
-- Version de PHP : 8.0.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `billeterie_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `categoriesevent`
--

DROP TABLE IF EXISTS `categoriesevent`;
CREATE TABLE IF NOT EXISTS `categoriesevent` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `categoriesevent`
--

INSERT INTO `categoriesevent` (`id`, `name`, `description`) VALUES
(1, 'Conférence', 'Une conférence académique ou professionnelle où des experts partagent leurs connaissances et expériences.'),
(2, 'Concert', 'Un événement musical où des artistes ou groupes se produisent en live.'),
(3, 'Atelier', 'Un événement éducatif pratique où les participants apprennent et appliquent des compétences spécifiques.'),
(4, 'Séminaire', 'Un événement de formation ou de développement personnel sur un sujet particulier.'),
(5, 'Festival', 'Un événement culturel ou artistique généralement organisé sur plusieurs jours.'),
(6, 'Exposition', 'Une présentation publique d’objets d’art, de sciences ou d’autres domaines d’intérêt.'),
(7, 'Webinaire', 'Un séminaire en ligne permettant aux participants d’interagir à distance.'),
(8, 'Salon', 'Un événement commercial ou professionnel réunissant des exposants et des visiteurs intéressés par un secteur particulier.'),
(9, 'Célébration', 'Un événement social ou culturel organisé pour célébrer une occasion spéciale (ex. : anniversaire, fête nationale, etc.).'),
(10, 'Match sportif', 'Un événement où deux équipes ou individus s’affrontent dans une compétition sportive.'),
(11, 'Marathon', 'Une course longue distance généralement de 42,195 km, souvent utilisée pour collecter des fonds pour des œuvres caritatives.'),
(12, 'Foire', 'Un grand événement commercial avec des stands de produits et services divers.'),
(13, 'Concours', 'Un événement compétitif où des participants rivalisent pour des prix.'),
(14, 'Réunion d\'affaires', 'Une rencontre professionnelle pour discuter d’affaires ou de projets.'),
(15, 'Séance de coaching', 'Un événement où un coach offre des conseils personnalisés sur divers aspects de la vie professionnelle ou personnelle.'),
(16, 'Événement de bienfaisance', 'Un événement organisé dans le but de collecter des fonds pour des œuvres de charité.'),
(17, 'Soirée', 'Un événement social informel, souvent organisé en soirée, avec de la musique, des boissons, et des animations.'),
(18, 'Festival gastronomique', 'Un événement célébrant la nourriture et la cuisine, où des chefs et des restaurants se rencontrent pour offrir des dégustations.'),
(19, 'Spectacle', 'Un événement de divertissement comme une pièce de théâtre, un ballet, ou une comédie musicale.'),
(20, 'Conférence en ligne', 'Un événement virtuel qui permet à un intervenant ou un panel de discuter d’un sujet devant un public en ligne.');

-- --------------------------------------------------------

--
-- Structure de la table `events`
--

DROP TABLE IF EXISTS `events`;
CREATE TABLE IF NOT EXISTS `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `category_id` int DEFAULT NULL,
  `location_type` enum('online','offline') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `city` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `website_url` varchar(255) DEFAULT NULL,
  `facebook_url` varchar(255) DEFAULT NULL,
  `whatsapp_url` varchar(255) DEFAULT NULL,
  `instagram_url` varchar(255) DEFAULT NULL,
  `twitter_url` varchar(255) DEFAULT NULL,
  `organizer_id` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_recurring` tinyint(1) DEFAULT '0',
  `status` tinyint NOT NULL DEFAULT '0' COMMENT '-2=reporté, -1=annulé, 0=en cours, 1=terminé',
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `organizer_id` (`organizer_id`)
) ENGINE=MyISAM AUTO_INCREMENT=71 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `events`
--

INSERT INTO `events` (`id`, `title`, `description`, `category_id`, `location_type`, `address`, `city`, `start_date`, `end_date`, `image_url`, `phone`, `website_url`, `facebook_url`, `whatsapp_url`, `instagram_url`, `twitter_url`, `organizer_id`, `created_at`, `is_recurring`, `status`) VALUES
(68, 'CONFERENCE SUR LE CANCER DU COLON', 'DAGABCI', 2, 'offline', '3 Rue du professeur jules driessens', 'Yamoussoukro', '2025-05-31 00:00:00', '2025-05-31 00:00:00', '/uploads/image-1748528959000-447015455.jpg', '0141913789', 'www.himrass.com', NULL, NULL, NULL, NULL, 7, '2025-05-29 14:29:19', 0, 0),
(69, 'POLA', '', 2, 'offline', '3 Rue du professeur jules driessens', 'Lille', '2025-05-29 00:00:00', '2025-05-29 08:00:00', '/uploads/image-1748532277360-103024273.jpeg', '0141913789', NULL, NULL, NULL, NULL, NULL, 7, '2025-05-29 15:24:37', 0, 0),
(70, 'SHOWH', 'DE', 2, 'offline', '3 Rue du professeur jules driessens', 'Lille', NULL, NULL, '/uploads/image-1748537885025-290294338.webp', '0141913789', NULL, NULL, NULL, NULL, NULL, 7, '2025-05-29 16:58:05', 1, 1),
(67, 'CONFERENCE SUR LE CANCER DU COLON', 'DAGABCI', 2, 'offline', '3 Rue du professeur jules driessens', 'Yamoussoukro', '2025-05-31 00:00:00', '2025-05-31 00:00:00', NULL, '0141913789', 'www.himrass.com', NULL, NULL, NULL, NULL, 7, '2025-05-29 14:28:10', 0, 0),
(64, 'LAMANO', 'AJAHAHAHA', 2, 'offline', 'Koumassi Pangolin', 'Koumassi SOGEFIA', NULL, NULL, '/uploads/image-1748484378356-340823120.jpeg', '0141913789', NULL, NULL, NULL, NULL, NULL, 7, '2025-05-29 02:06:18', 1, 0),
(65, 'jkl', '', 3, 'offline', '3 Rue du professeur jules driessens', 'Yamoussoukro', '2025-05-21 08:00:00', '2025-05-21 08:00:00', '/uploads/image-1748484492371-112478761.jpg', '0141913789', NULL, NULL, NULL, NULL, NULL, 7, '2025-05-29 02:08:12', 0, 1),
(66, 'jkl', '', 3, 'offline', '3 Rue du professeur jules driessens', 'Yamoussoukro', '2025-05-21 08:00:00', '2025-05-21 08:00:00', '/uploads/image-1748484640484-258087043.jpg', '0141913789', NULL, NULL, NULL, NULL, NULL, 7, '2025-05-29 02:10:40', 0, 1),
(58, 'FESTIVAL DE LA CULTURE', '', 3, 'offline', 'Bramakote', 'Ouaga', '2025-10-09 00:00:00', '2025-10-24 00:00:00', '/uploads/image-1748476393379-287376159.jpg', '0102040506', 'www.faya.com', NULL, NULL, NULL, 'https://twitetrtiek.com', 7, '2025-05-28 23:53:13', 0, 0),
(59, 'SDM ET WARREN', 'Palais de la culture', 3, 'offline', 'Treichville', 'Abidjan', NULL, NULL, '/uploads/image-1748478447169-417966863.jpg', '0749104942', 'www.junia.com', NULL, NULL, NULL, NULL, 7, '2025-05-29 00:27:27', 1, 0),
(60, 'CONCERT YABONGO', '10 ANS DE CARRIERE', 2, 'offline', 'BADING CILEST', 'TROMPE', '2025-05-31 00:00:00', '2025-05-31 00:00:00', '/uploads/image-1748478787441-899268123.jpg', '1478500333', NULL, NULL, NULL, NULL, NULL, 7, '2025-05-29 00:33:07', 0, 0),
(61, 'MANOU', 'D', 3, 'online', NULL, NULL, NULL, NULL, '/uploads/image-1748479113194-122188160.jpg', '0506002400', 'www.junia.com', NULL, NULL, NULL, 'https://twitetrtiek.com', 7, '2025-05-29 00:38:33', 1, 0),
(62, 'LA DIVA JSOSEY', 'DEE', 1, 'offline', 'PARC DES EXPOSITIONS', 'Abdijan', NULL, NULL, '/uploads/image-1748480261384-681813043.jpg', '0205027896', 'www.tikenjah.com', NULL, NULL, NULL, 'https://twitetrtiek.com', 7, '2025-05-29 00:57:41', 1, 0),
(63, 'LESKY', 'JALOUX', 2, 'offline', '3 Rue du professeur jules driessens', 'Yamoussoukro', '2025-05-21 00:07:00', '2025-05-21 08:00:00', '/uploads/image-1748484113336-468063566.jpg', '0141913789', NULL, NULL, NULL, NULL, NULL, 7, '2025-05-29 02:01:53', 0, 1),
(56, 'CONCERT HIMRA PARC DES EXPOSITIONS', 'Après avoir marqué les esprits avec HIMRA , koba la D, Jeune Lion … lors de la 7e édition , CDMG arrive le 09 Août 2025 avec « CDMG INFINITY ».  L’événement des vacances 2025 ! Prestations des meilleurs artistes de Babi et d’ailleurs , découverte de nouveaux talents , expositions d’arts culturels , village commercial et biens d’autres nouvelles activités , From Ivory Coast To Every Coast , Welcome to the CDMG infinity ♾', 2, 'offline', 'Angré aux oscars', 'Abidjan-Angre', NULL, NULL, '/uploads/image-1748475240348-702507202.jpg', '0104090507', 'www.himra.com', NULL, NULL, NULL, 'https://twitetrtiek.com', 7, '2025-05-28 23:34:00', 1, 0),
(57, 'CONCERT JOSEY', '\"But I must explain to you how all this mistaken idea of denouncing pleasure and praising pain was born and I will give you a complete account of the system, and expound the actual teachings of the great explorer of the truth, the master-builder of human happiness. No one rejects, dislikes, or avoids pleasure itself, because it is pleasure, but because those who do not know how to pursue pleasure rationally encounter consequences that are extremely painful. Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but because occasionally circumstances occur in which toil and pain can procure him some great pleasure. To take a trivial example, which of us ever undertakes laborious physical exercise, except to obtain some advantage from it? But who has any right to find fault with a man who chooses to enjoy a pleasure that has no annoying consequences, or one who avoids a pain that produces no resultant pleasure?\"', 1, 'offline', 'DOMAINE BINI', 'ABIDJAN ', '2025-05-28 00:00:00', '2025-05-29 08:00:00', '/uploads/image-1748475991251-32825704.jpg', '0506002400', NULL, NULL, NULL, NULL, NULL, 7, '2025-05-28 23:46:31', 0, 0);

-- --------------------------------------------------------

--
-- Structure de la table `event_dates`
--

DROP TABLE IF EXISTS `event_dates`;
CREATE TABLE IF NOT EXISTS `event_dates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `date` date NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`)
) ENGINE=MyISAM AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `event_dates`
--

INSERT INTO `event_dates` (`id`, `event_id`, `date`, `start_time`, `end_time`) VALUES
(39, 70, '2025-05-27', '06:06:00', '16:57:16'),
(38, 70, '2025-05-28', '16:56:46', '23:00:00'),
(37, 64, '2025-05-31', '04:00:00', '07:00:00'),
(36, 64, '2025-05-24', '09:07:05', '00:00:04'),
(35, 62, '2027-05-06', '00:07:00', '00:06:00'),
(34, 62, '2026-05-31', '00:07:00', '23:07:07'),
(33, 62, '2025-06-26', '00:00:00', '07:00:00'),
(32, 61, '2025-05-30', '07:00:07', '00:07:00'),
(31, 61, '2025-06-25', '00:07:00', '07:07:07'),
(30, 59, '2025-06-19', '10:00:00', '22:00:00'),
(29, 59, '2025-05-16', '00:00:00', '05:00:00'),
(28, 56, '2025-07-04', '00:07:07', '04:00:00'),
(27, 56, '2025-07-31', '23:00:00', '16:00:00'),
(26, 56, '2025-06-28', '07:00:00', '00:44:10'),
(25, 56, '2025-05-29', '00:00:07', '23:07:44');

-- --------------------------------------------------------

--
-- Structure de la table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
CREATE TABLE IF NOT EXISTS `favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `event_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_favorite` (`user_id`,`event_id`),
  KEY `fk_fav_event` (`event_id`)
) ENGINE=MyISAM AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Structure de la table `payment_methods`
--

DROP TABLE IF EXISTS `payment_methods`;
CREATE TABLE IF NOT EXISTS `payment_methods` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int DEFAULT NULL,
  `payment_type` enum('visa','moov','orange','mtn','mastercard','wave','djamo') NOT NULL,
  `rib` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `billing_address` varchar(255) DEFAULT NULL,
  `billing_city` varchar(100) DEFAULT NULL,
  `id_card_number` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_event` (`event_id`)
) ENGINE=MyISAM AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `payment_methods`
--

INSERT INTO `payment_methods` (`id`, `event_id`, `payment_type`, `rib`, `first_name`, `last_name`, `phone_number`, `email`, `billing_address`, `billing_city`, `id_card_number`) VALUES
(19, 61, 'djamo', NULL, 'eee', 's', '4512', NULL, NULL, NULL, NULL),
(20, 62, 'mastercard', '8888888888888', 'Franck', 'Kadio', NULL, NULL, '3 Rue du professeur jules driessens', 'Lille', '222222222222'),
(17, 59, 'mtn', NULL, 'Dobra', 'PELE', '0205026', NULL, NULL, 'Abidjan', NULL),
(18, 60, 'orange', NULL, 'Kyni Franck José', 'Kadio', '0141913789', 'Kadiofranck.jose@gmail.com', '3 Rue du professeur jules driessens', 'Yamoussoukro', NULL),
(16, 58, 'mtn', NULL, 'Kyni Franck José', 'Kadio', '4152639', 'Kadiofranck.jose@gmail.com', '3 Rue du professeur jules driessens', 'Lille', NULL),
(15, 57, 'mastercard', NULL, 'Doffi', 'Logbo', NULL, NULL, NULL, NULL, '77777777777777888'),
(14, 56, 'wave', NULL, 'Junioe', 'Sahuie', '05060222863', NULL, NULL, NULL, NULL),
(21, 63, 'wave', NULL, 'Franck', 'Kadio', '8529655', NULL, '3 Rue du professeur jules driessens', 'Lille', NULL),
(22, 64, 'mtn', NULL, 'Kyni Franck José', 'Kadio', '54210', 'Kadiofranck.jose@gmail.com', '3 Rue du professeur jules driessens', 'Lille', NULL),
(23, 65, 'orange', NULL, 'Franck', 'Kadio', '9/865', NULL, '3 Rue du professeur jules driessens', 'Lille', NULL),
(24, 66, 'orange', NULL, 'Franck', 'Kadio', '9/865', NULL, '3 Rue du professeur jules driessens', 'Lille', NULL),
(25, 68, 'mtn', NULL, 'Paka', 'daba', '0104050806', NULL, NULL, NULL, NULL),
(26, 69, 'mtn', NULL, 'Kyni Franck José', 'Kadio', '014785963', 'Kadiofranck.jose@gmail.com', '3 Rue du professeur jules driessens', 'Lille', NULL),
(27, 70, 'mtn', '85555', 'Kyni Franck José', 'Kadio', '55555555555', 'Kadiofranck.jose@gmail.com', '3 Rue du professeur jules driessens', 'Lille', NULL);

-- --------------------------------------------------------

--
-- Structure de la table `reservations`
--

DROP TABLE IF EXISTS `reservations`;
CREATE TABLE IF NOT EXISTS `reservations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `event_id` int NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `payment_method` enum('visa','mastercard','moov','orange','mtn','wave','djamo') NOT NULL,
  `payment_status` enum('pending','completed','failed') DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `event_id` (`event_id`)
) ENGINE=MyISAM AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `reservations`
--

INSERT INTO `reservations` (`id`, `user_id`, `event_id`, `total_amount`, `payment_method`, `payment_status`, `created_at`) VALUES
(54, 5, 61, '47000.00', 'visa', 'completed', '2025-05-30 00:07:33'),
(53, 5, 61, '47000.00', 'visa', 'completed', '2025-05-30 00:07:33'),
(52, 5, 61, '47000.00', 'visa', 'completed', '2025-05-30 00:07:22'),
(51, 5, 61, '1478523.00', 'visa', 'completed', '2025-05-30 00:07:11'),
(50, 5, 61, '1478523.00', 'visa', 'completed', '2025-05-30 00:06:54'),
(49, 5, 61, '1478523.00', 'visa', 'completed', '2025-05-30 00:06:44'),
(48, 5, 69, '1140000.00', 'visa', 'completed', '2025-05-30 00:03:41'),
(47, 5, 62, '36000.00', 'visa', 'completed', '2025-05-29 23:46:27'),
(46, 5, 56, '20000.00', 'visa', 'completed', '2025-05-29 23:42:55'),
(45, 5, 69, '570000.00', 'visa', 'completed', '2025-05-29 23:40:35'),
(44, 5, 61, '1478523.00', 'visa', 'completed', '2025-05-29 23:32:53'),
(43, 5, 62, '18000.00', 'visa', 'completed', '2025-05-29 23:32:02'),
(42, 5, 69, '570000.00', 'visa', 'completed', '2025-05-29 23:29:41'),
(41, 5, 69, '570000.00', 'visa', 'completed', '2025-05-29 23:28:24'),
(40, 5, 69, '2850000.00', 'visa', 'completed', '2025-05-29 23:24:18'),
(39, 5, 68, '210000.00', 'orange', 'completed', '2025-05-29 23:20:40'),
(38, 5, 59, '23200.00', 'visa', 'completed', '2025-05-29 22:53:26'),
(37, 5, 62, '375000.00', 'visa', 'completed', '2025-05-29 22:14:55'),
(36, 5, 60, '58000.00', 'visa', 'completed', '2025-05-29 22:12:10'),
(35, 5, 56, '20000.00', 'visa', 'completed', '2025-05-29 22:09:33'),
(34, 5, 56, '20000.00', 'visa', 'completed', '2025-05-29 22:09:15'),
(33, 5, 68, '1160000.00', 'mtn', 'completed', '2025-05-29 22:06:41'),
(32, 5, 56, '778000.00', 'mastercard', 'completed', '2025-05-29 20:02:58'),
(31, 7, 57, '290000.00', 'wave', 'completed', '2025-05-29 19:56:44'),
(30, 7, 57, '145000.00', 'orange', 'completed', '2025-05-29 19:49:59'),
(55, 5, 61, '47000.00', 'visa', 'completed', '2025-05-30 00:07:33'),
(56, 5, 61, '47000.00', 'visa', 'completed', '2025-05-30 00:07:34'),
(57, 5, 68, '65000.00', 'visa', 'completed', '2025-05-30 00:07:54'),
(58, 5, 68, '65000.00', 'visa', 'completed', '2025-05-30 00:08:05'),
(59, 5, 61, '47000.00', 'visa', 'completed', '2025-05-30 00:09:02'),
(60, 8, 68, '80000.00', 'visa', 'completed', '2025-05-30 00:11:06'),
(61, 8, 68, '80000.00', 'visa', 'completed', '2025-05-30 00:11:14'),
(62, 8, 68, '80000.00', 'visa', 'completed', '2025-05-30 00:11:14'),
(63, 8, 68, '80000.00', 'visa', 'completed', '2025-05-30 00:11:14'),
(64, 8, 68, '80000.00', 'visa', 'completed', '2025-05-30 00:11:14'),
(65, 8, 68, '80000.00', 'visa', 'completed', '2025-05-30 00:11:15'),
(66, 8, 59, '5800.00', 'visa', 'completed', '2025-05-30 00:42:08'),
(67, 8, 58, '5000.00', 'visa', 'completed', '2025-05-30 00:57:46');

-- --------------------------------------------------------

--
-- Structure de la table `reservation_tickets`
--

DROP TABLE IF EXISTS `reservation_tickets`;
CREATE TABLE IF NOT EXISTS `reservation_tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reservation_id` int NOT NULL,
  `ticket_id` int NOT NULL,
  `quantity` int NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `reservation_id` (`reservation_id`),
  KEY `ticket_id` (`ticket_id`)
) ENGINE=MyISAM AUTO_INCREMENT=82 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `reservation_tickets`
--

INSERT INTO `reservation_tickets` (`id`, `reservation_id`, `ticket_id`, `quantity`, `unit_price`) VALUES
(68, 54, 45, 1, '47000.00'),
(67, 53, 45, 1, '47000.00'),
(66, 52, 45, 1, '47000.00'),
(65, 51, 46, 1, '1478523.00'),
(64, 50, 46, 1, '1478523.00'),
(63, 49, 46, 1, '1478523.00'),
(62, 48, 59, 2, '570000.00'),
(61, 47, 48, 2, '18000.00'),
(60, 46, 38, 1, '20000.00'),
(59, 45, 59, 1, '570000.00'),
(58, 44, 46, 1, '1478523.00'),
(57, 43, 48, 1, '18000.00'),
(56, 42, 59, 1, '570000.00'),
(55, 41, 59, 1, '570000.00'),
(54, 40, 59, 5, '570000.00'),
(53, 39, 57, 1, '80000.00'),
(52, 39, 56, 2, '65000.00'),
(51, 38, 43, 4, '5800.00'),
(50, 37, 48, 5, '18000.00'),
(49, 37, 47, 5, '57000.00'),
(48, 36, 44, 1, '58000.00'),
(47, 35, 38, 1, '20000.00'),
(46, 34, 38, 1, '20000.00'),
(45, 33, 56, 8, '65000.00'),
(44, 33, 57, 8, '80000.00'),
(43, 32, 38, 5, '20000.00'),
(42, 32, 37, 5, '18000.00'),
(41, 32, 36, 42, '14000.00'),
(40, 31, 41, 4, '65000.00'),
(39, 31, 40, 2, '15000.00'),
(38, 30, 41, 2, '65000.00'),
(37, 30, 40, 1, '15000.00'),
(69, 55, 45, 1, '47000.00'),
(70, 56, 45, 1, '47000.00'),
(71, 57, 56, 1, '65000.00'),
(72, 58, 56, 1, '65000.00'),
(73, 59, 45, 1, '47000.00'),
(74, 60, 57, 1, '80000.00'),
(75, 61, 57, 1, '80000.00'),
(76, 62, 57, 1, '80000.00'),
(77, 63, 57, 1, '80000.00'),
(78, 64, 57, 1, '80000.00'),
(79, 65, 57, 1, '80000.00'),
(80, 66, 43, 1, '5800.00'),
(81, 67, 42, 1, '5000.00');

-- --------------------------------------------------------

--
-- Structure de la table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
CREATE TABLE IF NOT EXISTS `tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int DEFAULT NULL,
  `ticket_type` enum('VVIP','VIP','Grand Public') NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `available_tickets` int NOT NULL,
  `advantages` text,
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`)
) ENGINE=MyISAM AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `tickets`
--

INSERT INTO `tickets` (`id`, `event_id`, `ticket_type`, `price`, `available_tickets`, `advantages`) VALUES
(59, 69, 'VIP', '570000.00', 190, NULL),
(57, 68, 'VIP', '80000.00', 170, NULL),
(58, 69, 'Grand Public', '41000.00', 4000, NULL),
(56, 68, 'Grand Public', '65000.00', 88, NULL),
(55, 67, 'VIP', '80000.00', 185, NULL),
(54, 67, 'Grand Public', '65000.00', 100, NULL),
(53, 66, 'Grand Public', '7770.00', 10, NULL),
(52, 65, 'Grand Public', '7770.00', 10, NULL),
(51, 64, 'Grand Public', '14000.00', 20000, 'OOO'),
(50, 63, 'VIP', '55550.00', 1, NULL),
(49, 63, 'VVIP', '55550.00', 1, NULL),
(48, 62, 'Grand Public', '18000.00', 92, NULL),
(47, 62, 'VIP', '57000.00', 9995, NULL),
(46, 61, 'VIP', '1478523.00', 96, NULL),
(45, 61, 'Grand Public', '47000.00', 994, NULL),
(44, 60, 'VIP', '58000.00', 0, 'SEAT P '),
(43, 59, 'Grand Public', '5800.00', 995, 'kaho'),
(42, 58, 'Grand Public', '5000.00', 9999, NULL),
(41, 57, 'VVIP', '65000.00', 94, 'Je te blague pas '),
(40, 57, 'VIP', '15000.00', 47, 'Au plafond'),
(39, 57, 'Grand Public', '4000.00', 100, 'Dans l\'herbe '),
(38, 56, 'VVIP', '20000.00', 592, 'Stade'),
(37, 56, 'VIP', '18000.00', 195, 'jujutsu kaisen'),
(36, 56, 'Grand Public', '14000.00', 1, NULL),
(60, 70, 'Grand Public', '47880.00', 100, 'DE');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `phoneNumber` varchar(15) NOT NULL,
  `email` varchar(255) NOT NULL,
  `balance` decimal(10,2) DEFAULT '0.00',
  `totalSpent` decimal(10,2) DEFAULT '0.00',
  `numOrders` int DEFAULT '0',
  `profile` tinyint(1) NOT NULL,
  `password` varchar(255) NOT NULL,
  `profile_picture` varchar(255) NOT NULL,
  `createdAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_phone` (`phoneNumber`),
  UNIQUE KEY `unique_email` (`email`(191))
) ENGINE=MyISAM AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `firstName`, `lastName`, `phoneNumber`, `email`, `balance`, `totalSpent`, `numOrders`, `profile`, `password`, `profile_picture`, `createdAt`, `updatedAt`) VALUES
(8, 'KIKO', 'MANU', '0141913788', 'kiko@gmail.com', '0.00', '0.00', 0, 0, '$2b$10$Q8FUcOmijVFfcvs4422pH.LvhKhwHdxWd7xlB/fgg7rQYlI/m6ntS', '', '2025-05-30 00:10:24', '2025-05-30 00:10:24'),
(7, 'teense', 'Ouattara', '0141913789', 'junior@gmail.com', '0.00', '0.00', 0, 1, '$2b$10$HGjiHT5t0X.bg1mTaVETX.TKApZJej44KXCQZqCrRR7ijcyQfa2ne', '', '2025-05-26 20:46:06', '2025-05-29 00:59:41'),
(6, 'Kyni', 'Kadio', '0702221680', 'cx80146@gmail.com', '0.00', '0.00', 0, 0, '$2b$10$JdF9cYmQgaRWyGj22OM9dOPoFfgUH/Ad9Rp/Hc49GI1ebiLmr6IIm', '', '2025-05-25 20:48:37', '2025-05-25 21:56:22'),
(5, 'Sing', 'Fofana', '0702221691', 'kadiofranck.jose@gmail.com', '0.00', '0.00', 0, 1, '$2b$10$Nna9TiZw9nS9gfvZq.d.geARQfitiSvqcAfAjtL.Wwr9tX4OQvAKq', '', '2025-04-21 17:18:05', '2025-06-01 22:13:43'),
(9, 'mamadou@gmail.com', 'a', '0205080902', 'mama@gmail.com', '0.00', '0.00', 0, 0, '$2b$10$63MlcwwD891w/ty0PaiSiuqFqIJTP7PNcI0nRUly7qIvEeLaf4nNG', '', '2025-06-01 20:42:08', '2025-06-01 20:42:08');
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
