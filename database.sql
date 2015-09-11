# ************************************************************
# Sequel Pro SQL dump
# Version 4096
#
# http://www.sequelpro.com/
# http://code.google.com/p/sequel-pro/
#
# Host: 127.0.0.1 (MySQL 5.6.26)
# Database: wallfly
# Generation Time: 2015-09-09 03:40:43 +0000
# ************************************************************


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


# Dump of table events
# ------------------------------------------------------------

DROP TABLE IF EXISTS `events`;

CREATE TABLE `events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` datetime NOT NULL,
  `event` varchar(1024) NOT NULL,
  `propertyId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `propertyId` (`propertyId`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;

INSERT INTO `events` (`id`, `date`, `event`, `propertyId`)
VALUES
	(1,'2015-08-03 13:30:00','Plumber fixing water system',3);

/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table inspections
# ------------------------------------------------------------

DROP TABLE IF EXISTS `inspections`;

CREATE TABLE `inspections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `comments` varchar(2048) NOT NULL,
  `propertyId` int(11) NOT NULL,
  `inspectorId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `inspectorId` (`inspectorId`),
  KEY `propertyId` (`propertyId`),
  CONSTRAINT `inspections_ibfk_1` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`),
  CONSTRAINT `inspections_ibfk_2` FOREIGN KEY (`inspectorId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `inspections` WRITE;
/*!40000 ALTER TABLE `inspections` DISABLE KEYS */;

INSERT INTO `inspections` (`id`, `date`, `comments`, `propertyId`, `inspectorId`)
VALUES
	(1,'2015-08-01 19:24:26','Some damage to the wall in the hallway. Otherwise generally clean and tidy.',3,6);

/*!40000 ALTER TABLE `inspections` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table messages
# ------------------------------------------------------------

DROP TABLE IF EXISTS `messages`;

CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `message` varchar(2048) NOT NULL,
  `sender` int(11) NOT NULL,
  `receiver` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fromId` (`sender`),
  KEY `toId` (`receiver`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender`) REFERENCES `users` (`id`),
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `messages` WRITE;
/*!40000 ALTER TABLE `messages` DISABLE KEYS */;

INSERT INTO `messages` (`id`, `timestamp`, `message`, `sender`, `receiver`)
VALUES
	(1,'2015-08-01 14:00:00','Hey mr agent, can you assist me?',5,6),
	(2,'2015-08-01 14:01:00','Sure can. What\'s up?',6,5),
	(3,'2015-08-02 09:14:09','The water tank is leaking. It\'s pretty urgent.',5,6),
	(8,'2015-08-02 21:34:34','Saved in the DB',5,6),
	(9,'2015-08-31 01:20:22','Hello!',5,6);

/*!40000 ALTER TABLE `messages` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table payments
# ------------------------------------------------------------

DROP TABLE IF EXISTS `payments`;

CREATE TABLE `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `tenantId` int(11) NOT NULL,
  `propertyId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `tenantId` (`tenantId`),
  KEY `propertyId` (`propertyId`),
  CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`tenantId`) REFERENCES `users` (`id`),
  CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `payments` WRITE;
/*!40000 ALTER TABLE `payments` DISABLE KEYS */;

INSERT INTO `payments` (`id`, `date`, `amount`, `tenantId`, `propertyId`)
VALUES
	(1,'2015-08-01',820.25,5,3),
	(2,'2015-07-01',820.25,5,3);

/*!40000 ALTER TABLE `payments` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table properties
# ------------------------------------------------------------

DROP TABLE IF EXISTS `properties`;

CREATE TABLE `properties` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `street` varchar(500) NOT NULL,
  `suburb` varchar(500) NOT NULL,
  `postcode` varchar(4) NOT NULL,
  `photo` varchar(1000) DEFAULT NULL,
  `tenantId` int(11) DEFAULT NULL,
  `agentId` int(11) NOT NULL,
  `ownerId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `tenantId` (`tenantId`),
  KEY `agentId` (`agentId`),
  KEY `ownerId` (`ownerId`),
  CONSTRAINT `properties_ibfk_1` FOREIGN KEY (`tenantId`) REFERENCES `users` (`id`),
  CONSTRAINT `properties_ibfk_2` FOREIGN KEY (`agentId`) REFERENCES `users` (`id`),
  CONSTRAINT `properties_ibfk_3` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `properties` WRITE;
/*!40000 ALTER TABLE `properties` DISABLE KEYS */;

INSERT INTO `properties` (`id`, `street`, `suburb`, `postcode`, `photo`, `tenantId`, `agentId`, `ownerId`)
VALUES
	(3,'123 Fake Street','Brisbane','4000','/uploads/properties/123fake_asdf89asdf.jpg',5,6,7);

/*!40000 ALTER TABLE `properties` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table repair_requests
# ------------------------------------------------------------

DROP TABLE IF EXISTS `repair_requests`;

CREATE TABLE `repair_requests` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `request` varchar(2048) NOT NULL,
  `photo` varchar(255) NOT NULL,
  `status` enum('Submitted','Pending','Approved','Declined') DEFAULT 'Submitted',
  `tenantId` int(11) NOT NULL,
  `propertyId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `propertyId` (`propertyId`),
  KEY `tenantId` (`tenantId`),
  CONSTRAINT `repair_requests_ibfk_1` FOREIGN KEY (`tenantId`) REFERENCES `users` (`id`),
  CONSTRAINT `repair_requests_ibfk_2` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `repair_requests` WRITE;
/*!40000 ALTER TABLE `repair_requests` DISABLE KEYS */;

INSERT INTO `repair_requests` (`id`, `date`, `request`, `photo`, `status`, `tenantId`, `propertyId`)
VALUES
	(1,'2015-09-04 13:22:38','Hi can you fix up the water tank? The water tank has been leaking since yesterday. Thank you.','/uploads/repairs/123fake_10122015_asdf8asd8f7.jpg','Submitted',5,3),
	(2,'2015-09-06 13:38:05','This is a description','/uploads/repairs/123fake_10122015_asdf8asd8f7.jpg','Submitted',5,3);

/*!40000 ALTER TABLE `repair_requests` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table user_types
# ------------------------------------------------------------

DROP TABLE IF EXISTS `user_types`;

CREATE TABLE `user_types` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `user_types` WRITE;
/*!40000 ALTER TABLE `user_types` DISABLE KEYS */;

INSERT INTO `user_types` (`id`, `type`)
VALUES
	(2,'agent'),
	(3,'owner'),
	(1,'tenant');

/*!40000 ALTER TABLE `user_types` ENABLE KEYS */;
UNLOCK TABLES;


# Dump of table users
# ------------------------------------------------------------

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(60) NOT NULL COMMENT 'bcrypt hash',
  `firstName` varchar(500) NOT NULL,
  `lastName` varchar(500) NOT NULL,
  `phone` varchar(10) NOT NULL,
  `email` varchar(255) NOT NULL,
  `userType` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `userType` (`userType`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`userType`) REFERENCES `user_types` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;

INSERT INTO `users` (`id`, `username`, `password`, `firstName`, `lastName`, `phone`, `email`, `userType`)
VALUES
	(5,'kerrin','$2a$08$4gcWPNg.QaZUR62GHtLA0uYeU.g0ypH38Bx9krwVaMWVeTVHq.lS6','kerrin','english','0432123123','k@k.com',1),
	(6,'agent','$2a$08$lcUjO.hx3ERc/HoPwMcISOuV1k9BUZXi3mCKmSwavQ1oLAoQUMDtW','agent','agent','38121234','agent@agent.com',2),
	(7,'owner','$2a$08$LfEyo2H9j3rvZzxLXE2oIORg0y9LNDoXuV4EIxeHZ22d/IoQKFt0C','owner','owner','38004321','owner@owner.com',3),
	(8,'jim','$2a$08$LM9y9VmgsM7slqB8OHXHL.cxTJivNz77ZfIseUeD/0ppKFA.o3gNq','jim','jim','12341234','jim@jim.com',1);

/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;



/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
