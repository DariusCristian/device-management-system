USE DeviceManagementDb;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Name = 'John Smith')
BEGIN
INSERT INTO dbo.Users (Name, Role, Location)
VALUES ('John Smith', 'Manager', 'London');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Users WHERE Name = 'Anna Brown')
BEGIN
INSERT INTO dbo.Users (Name, Role, Location)
VALUES ('Anna Brown', 'QA Engineer', 'Berlin');
END
GO

DECLARE @JohnId INT = (SELECT Id FROM dbo.Users WHERE Name = 'John Smith');
DECLARE @AnnaId INT = (SELECT Id FROM dbo.Users WHERE Name = 'Anna Brown');

IF NOT EXISTS (SELECT 1 FROM dbo.Devices WHERE Name = 'iPhone 15')
BEGIN
INSERT INTO dbo.Devices
(
    Name, Manufacturer, Type, OperatingSystem, OsVersion,
    Processor, RamAmount, Description, AssignedUserId
)
VALUES
    (
        'iPhone 15', 'Apple', 'Phone', 'iOS', '17',
        'A16 Bionic', 6, 'Company phone for business use', @JohnId
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Devices WHERE Name = 'Galaxy Tab S9')
BEGIN
INSERT INTO dbo.Devices
(
    Name, Manufacturer, Type, OperatingSystem, OsVersion,
    Processor, RamAmount, Description, AssignedUserId
)
VALUES
    (
        'Galaxy Tab S9', 'Samsung', 'Tablet', 'Android', '14',
        'Snapdragon 8 Gen 2', 8, 'Tablet for internal testing', @AnnaId
    );
END
GO