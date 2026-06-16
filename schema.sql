-- Create Database if not exists
CREATE DATABASE IF NOT EXISTS `machinelink`;
USE `machinelink`;

-- Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `role` VARCHAR(20) NOT NULL DEFAULT 'operator',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Machines Table
CREATE TABLE IF NOT EXISTS `machines` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `machine_name` VARCHAR(100) NOT NULL,
  `status` ENUM('Active', 'Offline', 'Maintenance') NOT NULL DEFAULT 'Offline',
  `location` VARCHAR(100) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Machine Metrics Table (Telemetry Logs)
CREATE TABLE IF NOT EXISTS `machine_metrics` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `machine_id` INT NOT NULL,
  `temperature` DECIMAL(5,2) NOT NULL,
  `rpm` INT NOT NULL,
  `voltage` DECIMAL(5,2) NOT NULL,
  `current` DECIMAL(5,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`machine_id`) REFERENCES `machines`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alerts Table
CREATE TABLE IF NOT EXISTS `alerts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `machine_id` INT NOT NULL,
  `message` VARCHAR(255) NOT NULL,
  `severity` ENUM('Info', 'Warning', 'Critical') NOT NULL DEFAULT 'Info',
  `resolved` TINYINT(1) NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`machine_id`) REFERENCES `machines`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pre-seed some machines
INSERT INTO `machines` (`id`, `machine_name`, `status`, `location`) VALUES
(1, 'CNC Milling Machine Alpha', 'Active', 'Assembly Line A'),
(2, 'Robotic Welding Arm Beta', 'Active', 'Welding Cell 2'),
(3, 'Injection Molding Gamma', 'Maintenance', 'Plastic Molding Dept'),
(4, 'Hydraulic Press Delta', 'Offline', 'Heavy Press Shop'),
(5, 'Packaging Conveyor Epsilon', 'Active', 'Packaging Line 1')
ON DUPLICATE KEY UPDATE `machine_name`=VALUES(`machine_name`), `status`=VALUES(`status`), `location`=VALUES(`location`);

-- Pre-seed admin user
-- Password for the seeded user will be 'admin123'
-- Hash generated for 'admin123' using bcrypt (cost factor 10)
-- To ensure compatibility, the backend also auto-creates this user on boot if missing.
INSERT INTO `users` (`id`, `username`, `password_hash`, `email`, `role`) VALUES
(1, 'admin', '$2a$10$RqR.q3hVa5K7AKVqLKdk0e9XeUiTdPv0RwloYcskJD/nVTHfK1F0W', 'admin@machinelink.io', 'admin')
ON DUPLICATE KEY UPDATE `username`=VALUES(`username`), `email`=VALUES(`email`), `role`=VALUES(`role`);
