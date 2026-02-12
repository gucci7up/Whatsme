<?php

class AccountController
{
    private $db;
    private $waService;

    public function __construct()
    {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->waService = new WhatsAppService();
    }

    public function create()
    {
        $data = json_decode(file_get_contents("php://input"));

        if (!isset($data->client_name) || !isset($data->phone_number)) {
        // Phone number optional if unknown
        // But we need a name
        }

        $token = bin2hex(random_bytes(32));
        $clientName = $data->client_name;
        $phone = $data->phone_number ?? '';
        $sessionPath = 'session_' . uniqid();

        $query = "INSERT INTO whatsapp_accounts (client_name, phone_number, api_token, session_path, status) VALUES (:name, :phone, :token, :path, 'disconnected')";
        $stmt = $this->db->prepare($query);

        $stmt->bindParam(':name', $clientName);
        $stmt->bindParam(':phone', $phone);
        $stmt->bindParam(':token', $token);
        $stmt->bindParam(':path', $sessionPath);

        if ($stmt->execute()) {
            echo json_encode(["message" => "Account created", "id" => $this->db->lastInsertId(), "token" => $token]);
        }
        else {
            http_response_code(500);
            echo json_encode(["message" => "Unable to create account"]);
        }
    }

    public function getAll()
    {
        // Auth check should be here
        $query = "SELECT id, client_name, phone_number, status, created_at, api_token FROM whatsapp_accounts";
        $stmt = $this->db->prepare($query);
        $stmt->execute();
        $accounts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($accounts);
    }

    public function connect($id)
    {
        // Tell Node service to init session
        $res = $this->waService->connect($id);
        echo json_encode($res['response']);
    }

    public function getQr($id)
    {
        $res = $this->waService->getQr($id);
        if ($res['code'] == 200) {
            echo json_encode($res['response']);
        }
        else {
            http_response_code($res['code']);
            echo json_encode($res['response']);
        }
    }

    public function disconnect($id)
    {
        // Implement disconnect logic
        // Update DB status
        $query = "UPDATE whatsapp_accounts SET status = 'disconnected' WHERE id = :id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        echo json_encode(["message" => "Account disconnected (DB updated)"]);
    }
}
