# InventoryMS – Inventory Management System

A full-stack inventory and loan management system built with ASP.NET Core, React, and MySQL — containerised with Docker for easy deployment.

---

## Prerequisites

You only need **Docker Desktop** installed. No need to install .NET, Node.js, or MySQL separately.

- [Download Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows / Mac / Linux)

---

## Getting Started

1. Unzip the project folder
2. Open a terminal inside the folder
3. Navigate to the backend folder: `cd backend`
4. Run:

```bash
docker compose up --build
```

Once running, open your browser:

| Service  | URL                        |
|----------|----------------------------|
| Frontend | http://localhost:3000       |
| Backend  | http://localhost:7028/api   |
| Swagger  | http://localhost:7028/swagger |

---

## Default Login

On first run, seed the database with a default admin account. *(See Known Issues below.)*

| Field    | Value                  |
|----------|------------------------|
| Email    | admin@hull.ac.uk  |
| Password | Admin@123|

---

## Stopping the App

```bash
# Stop containers
docker compose down

# Stop and wipe the database (clean slate)
docker compose down -v
```

---

## Known Issues

- **Overdue loans error on startup** — if the Loans table does not exist yet (before migrations run), the overdue check service may log an error. This is non-critical and resolves once the DB is initialised.

---

## Tech Stack

- **Frontend** — React (port 3000)
- **Backend** — ASP.NET Core 6 (port 7028)
- **Database** — MySQL 8.0
- **Containerisation** — Docker & Docker Compose
