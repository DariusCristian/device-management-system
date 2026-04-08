# Device Management System

A full-stack device management application built with ASP.NET Core, Angular, SQL Server, and Gemini AI.

## Project Overview

This project was developed in multiple phases and includes:

- Device and user management API
- Angular user interface
- Authentication and authorization
- Device assignment and unassignment
- AI-generated device descriptions
- Bonus free-text search with ranked results

## Tech Stack

- Backend: ASP.NET Core Web API
- Frontend: Angular
- Database: SQL Server
- ORM: Entity Framework Core
- Authentication: Custom basic authentication with hashed passwords
- AI Integration: Google Gemini API

## Implemented Features

### Phase 1 – Backend/API
- CRUD for users
- CRUD for devices
- SQL Server database integration
- Entity Framework migrations

### Phase 2 – User Interface
- List all devices
- View selected device details
- Create device
- Update device
- Delete device

### Phase 3 – Authentication + Authorization
- User registration
- User login
- Assign device to logged-in user
- Unassign device from logged-in user

### Phase 4 – AI Integration
- Generate human-readable device descriptions from technical specifications using Gemini AI

### Bonus Phase – Search
- Free-text device search
- Search considers: Name, Manufacturer, RAM, Processor
- Case-insensitive and token-based normalization
- Deterministic relevance ranking

## Prerequisites

Make sure you have installed:

- .NET SDK
- Node.js
- Angular CLI
- Docker
- SQL Server container/image
- Gemini API key

## How to Run the Project Locally

### 1. Clone the repository

```bash
git clone <YOUR_GITHUB_REPO_URL>
cd device-management-system
