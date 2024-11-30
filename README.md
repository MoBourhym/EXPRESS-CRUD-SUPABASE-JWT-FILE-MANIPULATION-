# Backend for Employee Management System

This backend service powers the Employee Management System for business administrators to manage employee data, monitor activities, and enhance productivity. It leverages JWT for authentication, Supabase as the database backend, and implements protected routes to ensure secure access to sensitive data.

## Features

- **JWT Authentication**: Protects routes with access tokens and refresh tokens.
- **Supabase Integration**: Uses Supabase for user authentication and database management.
- **Protected Routes**: Secures API routes that require authentication.
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
git clone https://github.com/your-username/backend-repository.git
cd backend-repository
