<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET,POST,PUT,DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Basic Autoloader
spl_autoload_register(function ($class_name) {
    include 'src/' . $class_name . '.php';
});

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode( '/', $uri );

// Simple Router
// URI structure: /api/resource/id/action
// $uri[1] = 'api'
// $uri[2] = resource (e.g., 'accounts', 'send-message', 'logs')

if (!isset($uri[1]) || $uri[1] != 'api') {
    http_response_code(404);
    echo json_encode(["message" => "Not Found"]);
    exit();
}

$resource = $uri[2] ?? null;
$id = $uri[3] ?? null;
$action = $uri[4] ?? null;

// Routing Logic
if ($resource === 'accounts') {
    $controller = new AccountController();
    $method = $_SERVER['REQUEST_METHOD'];

    if ($id) {
        // /api/accounts/{id} or /api/accounts/{id}/action
        if ($action === 'qr') {
            $controller->getQr($id);
        } elseif ($action === 'connect') {
            $controller->connect($id);
        } elseif ($action === 'disconnect') {
            $controller->disconnect($id);
        } else {
             // Generic ID operations if needed
             echo json_encode(["message" => "Endpoint not implemented"]);
        }
    } else {
         // /api/accounts
         if ($method === 'POST' && isset($uri[3]) && $uri[3] === 'create') {
             $controller->create();
         } elseif ($method === 'GET') {
             $controller->getAll();
         } else {
             http_response_code(405);
             echo json_encode(["message" => "Method Not Allowed"]);
         }
    }
} elseif ($resource === 'send-message') {
    $controller = new MessageController();
    $controller->send();
} elseif ($resource === 'logs') {
    $controller = new LogController();
    $controller->getAll();
} else {
    http_response_code(404);
    echo json_encode(["message" => "Endpoint Not Found"]);
}
