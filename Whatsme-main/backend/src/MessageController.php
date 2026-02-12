<?php

class MessageController
{
    private $db;
    private $waService;

    public function __construct()
    {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->waService = new WhatsAppService();
    }

    private function getAccountByToken($token)
    {
        $query = "SELECT id, status FROM whatsapp_accounts WHERE api_token = :token LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':token', $token);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    private function checkRateLimit($accountId)
    {
        // Limit: 20 messages per hour
        $query = "SELECT COUNT(*) as count FROM message_logs WHERE account_id = :id AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $accountId);
        $stmt->execute();
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['count'] < 20;
    }

    private function logMessage($accountId, $recipient, $content, $status)
    {
        $query = "INSERT INTO message_logs (account_id, recipient, content, status) VALUES (:id, :recipient, :content, :status)";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $accountId);
        $stmt->bindParam(':recipient', $recipient);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':status', $status);
        $stmt->execute();
    }

    public function send()
    {
        // Authenticate
        $headers = getallheaders();
        $authHeader = $headers['Authorization'] ?? '';
        $token = str_replace('Bearer ', '', $authHeader);

        if (!$token) {
            http_response_code(401);
            echo json_encode(["message" => "Unauthorized"]);
            return;
        }

        $account = $this->getAccountByToken($token);
        if (!$account) {
            http_response_code(401);
            echo json_encode(["message" => "Invalid Token"]);
            return;
        }

        if ($account['status'] !== 'connected') {
            http_response_code(400);
            echo json_encode(["message" => "Account not connected"]);
            return;
        }

        if (!$this->checkRateLimit($account['id'])) {
            http_response_code(429);
            echo json_encode(["message" => "Rate limit exceeded (20 msgs/hr)"]);
            return;
        }

        $data = json_decode(file_get_contents("php://input"));
        $recipient = $data->to ?? '';
        $content = $data->message ?? '';

        if (!$recipient || !$content) {
            http_response_code(400);
            echo json_encode(["message" => "Missing 'to' or 'message'"]);
            return;
        }

        // Call Node Service
        $res = $this->waService->sendMessage($account['id'], $recipient, $content);

        if ($res['code'] == 200) {
            $this->logMessage($account['id'], $recipient, $content, 'sent');
            echo json_encode(["message" => "Message queued"]);
        }
        else {
            $this->logMessage($account['id'], $recipient, $content, 'failed');
            http_response_code(500);
            echo json_encode(["message" => "Failed to send message", "error" => $res['response']]);
        }
    }
}
