<?php

class WhatsAppService
{
    private $baseUrl;

    public function __construct()
    {
        $this->baseUrl = getenv('WHATSAPP_ENGINE_URL') ?: 'http://whatsapp-engine:3000';
    }

    private function request($method, $endpoint, $data = [])
    {
        $url = $this->baseUrl . $endpoint;
        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        return ['code' => $httpCode, 'response' => json_decode($response, true)];
    }

    public function connect($accountId)
    {
        return $this->request('POST', '/connect', ['accountId' => $accountId]);
    }

    public function getQr($accountId)
    {
        return $this->request('GET', "/qr/$accountId");
    }

    public function sendMessage($accountId, $recipient, $content)
    {
        return $this->request('POST', '/send-message', [
            'accountId' => $accountId,
            'recipient' => $recipient,
            'content' => $content
        ]);
    }
}
