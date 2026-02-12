CREATE TABLE IF NOT EXISTS whatsapp_accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(50),
    api_token VARCHAR(255) NOT NULL UNIQUE,
    session_path VARCHAR(255) NOT NULL,
    status ENUM('connected', 'disconnected') DEFAULT 'disconnected',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS message_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    account_id INT NOT NULL,
    recipient VARCHAR(50) NOT NULL,
    content TEXT,
    status ENUM('sent', 'failed', 'queued') DEFAULT 'sent',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES whatsapp_accounts(id) ON DELETE CASCADE
);
