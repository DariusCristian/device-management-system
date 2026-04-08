IF DB_ID('DeviceManagementDb') IS NULL
BEGIN
    CREATE DATABASE DeviceManagementDb;
END
GO

USE DeviceManagementDb;
GO

IF OBJECT_ID('dbo.Users', 'U') IS NULL
BEGIN
CREATE TABLE dbo.Users
(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Role NVARCHAR(100) NOT NULL,
    Location NVARCHAR(100) NOT NULL
);
END
GO

IF OBJECT_ID('dbo.Devices', 'U') IS NULL
BEGIN
CREATE TABLE dbo.Devices
(
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(100) NOT NULL,
    Manufacturer NVARCHAR(100) NOT NULL,
    Type NVARCHAR(50) NOT NULL,
    OperatingSystem NVARCHAR(100) NOT NULL,
    OsVersion NVARCHAR(50) NOT NULL,
    Processor NVARCHAR(100) NOT NULL,
    RamAmount INT NOT NULL,
    Description NVARCHAR(500) NOT NULL,
    AssignedUserId INT NULL,
    CONSTRAINT FK_Devices_Users FOREIGN KEY (AssignedUserId)
        REFERENCES dbo.Users(Id)
        ON DELETE SET NULL
);
END
GO