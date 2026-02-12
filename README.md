# WhatsApp Multi-Account API Dashboard

A self-hosted WhatsApp API solution with multi-account support, admin dashboard, and REST API. Built with React (Vite), PHP 8.2, Node.js (Baileys), and MySQL. Ready for deployment with Dokploy/Docker.

## Architecture

- **Frontend**: React + Vite (Port 5173). Admin Dashboard.
- **Backend**: PHP 8.2 + Apache (Port 8000). REST API & Business Logic.
- **WhatsApp Engine**: Node.js + Baileys (Port 1993 / Internal 3000). Handles WhatsApp connections.
- **Database**: MySQL 8.0. Stores accounts and logs.

## Prerequisites

- Docker & Docker Compose
- Git

## Installation & Deployment

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/gucci7up/Whatsme.git
    cd Whatsme
    ```

2.  **Configuration:**
    Copy `.env.example` to `.env` and adjust if necessary (default passwords are weak).
    ```bash
    cp .env.example .env
    ```

3.  **Start Services:**
    ```bash
    docker-compose up -d --build
    ```

4.  **Access the Dashboard:**
    Open `http://localhost:5173` in your browser.

## Usage Guide

### 1. Create an Account
- Go to the Dashboard.
- Click "New Account".
- Enter a name (e.g., "Support", "Sales").
- Click "Create".

### 2. Connect WhatsApp
- Click "Manage" on the created account.
- Click "Pair Device".
- Wait for the QR code to appear.
- Scan it with your WhatsApp mobile app (Linked Devices).
- Status should change to "connected".

### 3. Sending Messages (Dashboard)
- Go to the Account Details page.
- Enter the recipient phone number (with country code, e.g., `15551234567`).
- Enter the message.
- Click "Send Message".

### 4. API Usage (External)

**Base URL**: `http://localhost:8000/api`

**Authentication**:
All endpoints require the `Authorization: Bearer <API_TOKEN>` header. You can find the token in the Dashboard under Account Details.

**Endpoints**:

-   **Send Message**:
    `POST /send-message`
    ```json
    {
      "to": "15551234567",
      "message": "Hello World"
    }
    ```

-   **Get Logs**:
    `GET /logs`

-   **Disconnect**:
    `POST /accounts/{id}/disconnect`

## Rate Limiting
The system enforces a limit of **20 messages per hour** per account to protect against bans.

## Troubleshooting

-   **QR Code not appearing:** Check the `whatsapp-engine` logs: `docker logs whatsapp-engine`.
-   **Database connection error:** Ensure MySQL is running: `docker logs whatsapp-mysql`.

## Security Note
This is an unofficial API. Use at your own risk. Do not use for spam.

## GitHub Push
(If automatic push failed)
```bash
git add .
git commit -m "Initial commit"
git push -u origin master
```
