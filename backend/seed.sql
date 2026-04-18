-- MySQL dump 10.13  Distrib 5.7.24, for osx10.9 (x86_64)
--
-- Host: 127.0.0.1    Database: InventoryMs
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `__EFMigrationsHistory`
--

DROP TABLE IF EXISTS `__EFMigrationsHistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `__EFMigrationsHistory` (
  `MigrationId` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `ProductVersion` varchar(32) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`MigrationId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ActivityLogs`
--

DROP TABLE IF EXISTS `ActivityLogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ActivityLogs` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int DEFAULT NULL,
  `UserName` varchar(255) DEFAULT NULL,
  `ActivityType` varchar(50) NOT NULL,
  `Description` varchar(500) NOT NULL,
  `RelatedEntityType` varchar(50) DEFAULT NULL,
  `RelatedEntityId` int DEFAULT NULL,
  `CreatedAt` datetime NOT NULL,
  PRIMARY KEY (`Id`),
  KEY `UserId` (`UserId`),
  KEY `idx_activitylogs_type` (`ActivityType`),
  CONSTRAINT `activitylogs_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `AssetHistory`
--

DROP TABLE IF EXISTS `AssetHistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `AssetHistory` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `AssetId` int NOT NULL,
  `ChangedBy` int NOT NULL,
  `ChangeType` enum('Created','Updated','StatusChanged','ConditionChanged','Loaned','Returned','Deleted') NOT NULL,
  `OldValue` text,
  `NewValue` text,
  `Notes` text,
  `ChangedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `AssetId` (`AssetId`),
  KEY `ChangedBy` (`ChangedBy`),
  CONSTRAINT `assethistory_ibfk_1` FOREIGN KEY (`AssetId`) REFERENCES `Assets` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `assethistory_ibfk_2` FOREIGN KEY (`ChangedBy`) REFERENCES `Users` (`Id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Assets`
--

DROP TABLE IF EXISTS `Assets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Assets` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `CategoryId` int NOT NULL,
  `ItemCondition` varchar(50) DEFAULT NULL,
  `Description` text,
  `SerialNumber` varchar(100) DEFAULT NULL,
  `Status` enum('Available','CheckedOut','Reserved') NOT NULL DEFAULT 'Available',
  `PhysicalCondition` enum('Good','Fair','Poor','InRepair','Retired') NOT NULL DEFAULT 'Good',
  `PurchaseDate` date DEFAULT NULL,
  `PurchasePrice` decimal(10,2) DEFAULT NULL,
  `Notes` text,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `UpdatedAt` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `SerialNumber` (`SerialNumber`),
  KEY `CategoryId` (`CategoryId`),
  CONSTRAINT `assets_ibfk_1` FOREIGN KEY (`CategoryId`) REFERENCES `Categories` (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Categories`
--

DROP TABLE IF EXISTS `Categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Categories` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Name` varchar(100) NOT NULL,
  `Description` text,
  `MaxLoanDays` int DEFAULT '14',
  `RequiresApproval` tinyint(1) DEFAULT '1',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `Name` (`Name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `LoanRequests`
--

DROP TABLE IF EXISTS `LoanRequests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `LoanRequests` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  `AssetId` int NOT NULL,
  `RequestDate` datetime DEFAULT CURRENT_TIMESTAMP,
  `RequestedStartDate` datetime NOT NULL,
  `RequestedEndDate` datetime NOT NULL,
  `Purpose` text,
  `Status` enum('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
  `ReviewedByStaffId` int DEFAULT NULL,
  `ReviewedAt` datetime DEFAULT NULL,
  `RejectionReason` text,
  PRIMARY KEY (`Id`),
  KEY `UserId` (`UserId`),
  KEY `AssetId` (`AssetId`),
  KEY `ReviewedByStaffId` (`ReviewedByStaffId`),
  CONSTRAINT `loanrequests_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `loanrequests_ibfk_2` FOREIGN KEY (`AssetId`) REFERENCES `Assets` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `loanrequests_ibfk_3` FOREIGN KEY (`ReviewedByStaffId`) REFERENCES `Users` (`Id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Loans`
--

DROP TABLE IF EXISTS `Loans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Loans` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `AssetId` int NOT NULL,
  `UserId` int NOT NULL,
  `ApprovedByStaffId` int DEFAULT NULL,
  `CheckOutDate` datetime NOT NULL,
  `DueDate` datetime NOT NULL,
  `ReturnDate` datetime DEFAULT NULL,
  `ReturnCondition` int DEFAULT NULL,
  `ReturnNotes` text,
  `OverdueDays` int NOT NULL DEFAULT '0',
  `ReceivedByStaffId` int DEFAULT NULL,
  `Status` int NOT NULL DEFAULT '0',
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`Id`),
  KEY `AssetId` (`AssetId`),
  KEY `UserId` (`UserId`),
  KEY `ApprovedByStaffId` (`ApprovedByStaffId`),
  KEY `ReceivedByStaffId` (`ReceivedByStaffId`),
  CONSTRAINT `loans_ibfk_1` FOREIGN KEY (`AssetId`) REFERENCES `Assets` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `loans_ibfk_2` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `loans_ibfk_3` FOREIGN KEY (`ApprovedByStaffId`) REFERENCES `Users` (`Id`) ON DELETE SET NULL,
  CONSTRAINT `loans_ibfk_4` FOREIGN KEY (`ReceivedByStaffId`) REFERENCES `Users` (`Id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=37 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Notifications`
--

DROP TABLE IF EXISTS `Notifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Notifications` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `UserId` int NOT NULL,
  `Message` varchar(500) NOT NULL,
  `Type` enum('Overdue','DueSoon','Approved','Rejected','Info','Warning') NOT NULL,
  `IsRead` tinyint(1) DEFAULT '0',
  `ReadAt` datetime DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `RelatedLoanId` int DEFAULT NULL,
  `RelatedAssetId` int DEFAULT NULL,
  PRIMARY KEY (`Id`),
  KEY `UserId` (`UserId`),
  KEY `RelatedLoanId` (`RelatedLoanId`),
  KEY `RelatedAssetId` (`RelatedAssetId`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `Users` (`Id`) ON DELETE CASCADE,
  CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`RelatedLoanId`) REFERENCES `Loans` (`Id`) ON DELETE SET NULL,
  CONSTRAINT `notifications_ibfk_3` FOREIGN KEY (`RelatedAssetId`) REFERENCES `Assets` (`Id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Users` (
  `Id` int NOT NULL AUTO_INCREMENT,
  `Fname` varchar(120) NOT NULL,
  `Lname` varchar(120) NOT NULL,
  `UniversityId` varchar(50) NOT NULL,
  `Role` enum('Admin','Staff','Student') NOT NULL,
  `Email` varchar(150) NOT NULL,
  `PhoneNumber` varchar(20) DEFAULT NULL,
  `Department` varchar(100) DEFAULT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `IsActive` tinyint(1) DEFAULT '1',
  `LastLoginAt` datetime DEFAULT NULL,
  `CreatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
  `ResetToken` varchar(255) DEFAULT NULL,
  `ResetTokenExpiry` datetime DEFAULT NULL,
  PRIMARY KEY (`Id`),
  UNIQUE KEY `UniversityId` (`UniversityId`),
  UNIQUE KEY `Email` (`Email`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
-- Default admin account (password: Admin@123)
INSERT INTO Users (Fname, Lname, UniversityId, Role, Email, PhoneNumber, Department, PasswordHash, IsActive, CreatedAt)
VALUES (
    'Admin',
    'User',
    'ADMIN001',
    'Admin',
    'admin@hull.ac.uk',
    '07700000000',
    'Computer Science',
    '$2a$11$8vFsQLHjD3T1Y6nACJGiHuGGHSKijS2UENqYaTqQN0YSMhFf7Y0NO',
    1,
    NOW()
);

-- Dump completed on 2026-04-18  1:28:07
