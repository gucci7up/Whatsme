<?php

class LogController
{
    private $db;

    public function __construct()
    {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    public function getAll()
    {
        // Admin or Token auth? Assuming admin uses this endpoint for dashboard
        // Or user via token. Let's support token.

        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        $token = str_replace('Bearer ', '', $authHeader);

        if ($token) {
            // If token provided, get logs for that account
            $query = "SELECT l.* FROM message_logs l JOIN whatsapp_accounts a ON l.account_id = a.id WHERE a.api_token = :token ORDER BY l.created_at DESC LIMIT 100";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':token', $token);
            $stmt->execute();
        }
        else {
            // Admin view (no token check for now, or maybe simple auth needed)
            // For simplicity, return all logs if no token (DEV MODE) 
            // In prod, check Dashboard session
            $query = "SELECT * FROM message_logs ORDER BY created_at DESC LIMIT 100";
            $stmt = $this->db->prepare($query);
            $stmt->execute();
        }

        $logs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($logs);
    }
}
