# Backend for Employee Management System

This repository contains the backend service for the **Employee Management System** for business administrators. The system allows administrators to manage employee data, monitor activities, and enhance productivity. This backend service leverages JWT for authentication, Supabase for database management, and includes protected routes to ensure secure access to sensitive data.

This backend is part of the [Angular Productivity Application](https://github.com/MoBourhym/Angular-Productivity-Application.git), a full-stack solution for employee management.

## Features

- **JWT Authentication**: Protects routes using access tokens and refresh tokens.
- **Supabase Integration**: Utilizes Supabase for user authentication and database management.
- **Protected Routes**: API routes are secured, requiring valid JWT tokens.
- **Access Tokens & Refresh Tokens**: Implements token-based authentication for secure communication.

## Table of Contents

1. [Technologies](#technologies)
2. [Setup](#setup)
3. [Environment Variables](#environment-variables)
4. [Authentication](#authentication)
5. [API Endpoints](#api-endpoints)
6. [Running the Backend](#running-the-backend)
7. [Contributing](#contributing)

## Technologies

- **Node.js**: JavaScript runtime for building the backend API.
- **Express.js**: Web framework for handling HTTP requests.
- **JWT (JSON Web Tokens)**: Used to secure routes with access tokens and refresh tokens.
- **Supabase**: A backend-as-a-service platform for authentication and database management.
- **PostgreSQL**: Database powered by Supabase.

## Setup

### Clone the Repository

To get started, clone the repository to your local machine:

```bash
git clone "https://github.com/MoBourhym/EXPRESS-CRUD-SUPABASE-JWT-FILE-MANIPULATION-.git"
cd src
