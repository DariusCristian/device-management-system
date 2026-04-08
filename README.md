# Device Management System

A full-stack device management application built with **ASP.NET Core**, **Angular**, **SQL Server**, and **Gemini AI**.

---

## Project Overview

This project was developed across multiple phases and delivers a complete device lifecycle management solution, including:

- REST API for device and user management
- Angular single-page application
- Authentication and role-based authorization
- Device assignment and unassignment workflows
- AI-generated device descriptions via Google Gemini
- Free-text search with ranked results

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | ASP.NET Core Web API |
| Frontend | Angular |
| Database | SQL Server |
| ORM | Entity Framework Core |
| Authentication | Custom basic auth with hashed passwords |
| AI Integration | Google Gemini API |

---

## Implemented Features

### Phase 1 – Backend / API
- Full CRUD for users and devices
- SQL Server database integration
- Entity Framework Core migrations

### Phase 2 – User Interface
- List, view, create, update, and delete devices

### Phase 3 – Authentication & Authorization
- User registration and login
- Assign / unassign devices to the logged-in user

### Phase 4 – AI Integration
- Generate human-readable device descriptions from technical specs using Gemini AI

### Phase 5 – Search
- Free-text search across Name, Manufacturer, RAM, and Processor fields
- Case-insensitive, token-based normalization
- Deterministic relevance ranking

---

## Prerequisites

Ensure the following are installed before running the project:

- [.NET SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/)
- [Angular CLI](https://angular.io/cli)
- [Docker](https://www.docker.com/)
- SQL Server Docker image
- A valid [Gemini API key](https://aistudio.google.com/app/apikey)

---

## Running the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/DariusCristian/device-management-system.git
cd device-management-system
```

### 2. Start SQL Server (Docker)

```bash
docker start sqlserver
docker ps
```

### 3. Run the backend

```bash
cd DeviceManagement.Api
export GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
dotnet run
```

| Service | URL |
|---|---|
| Backend API | http://localhost:5125 |
| Swagger UI | http://localhost:5125/swagger |

### 4. Run the frontend

In a separate terminal:

```bash
cd device-management-ui
ng serve
```

| Service | URL |
|---|---|
| Angular UI | http://localhost:4200 |

---

## Testing the Application

### Authentication
1. Register a new user
2. Log in with that user

### Devices
1. Create a new device
2. Generate an AI description before saving
3. Update or delete existing devices

### Assignment
1. Assign an unassigned device to the logged-in user
2. Unassign a device previously assigned to the logged-in user

### Search
- Search by name, manufacturer, RAM, or processor

---

## Local Access Summary

| Service | URL |
|---|---|
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:5125 |
| Swagger | http://localhost:5125/swagger |
