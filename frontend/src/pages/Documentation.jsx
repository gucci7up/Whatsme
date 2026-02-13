import React from 'react';
import { BookOpen, Key, Webhook, Image, Code, CheckCircle, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Documentation() {
    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Documentación de Desarrollador</h1>
                    <p className="text-gray-500 mt-1">Guía completa para integrar Whatsme Gateway con tu CRM o sistema externo.</p>
                </div>
                <Link to="/" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors">
                    Volver al Dashboard
                </Link>
            </div>

            {/* 1. Autenticación */}
            <section id="auth" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                    <Shield className="text-green-600" />
                    <h2 className="text-xl font-bold text-gray-800">1. Autenticación</h2>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-gray-600">
                        Todas las peticiones a la API deben incluir el siguiente Header de seguridad.
                        Puedes encontrar o cambiar tu API Key en la configuración del servidor (Variable de entorno: <code>GATEWAY_API_KEY</code>).
                    </p>
                    <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-slate-300">
                        <span className="text-purple-400">Header:</span> x-api-key <br />
                        <span className="text-purple-400">Valor:</span> whatsme_secure_api_key_12345 (Valor por defecto)
                    </div>
                </div>
            </section>

            {/* 2. Enviar Mensajes */}
            <section id="send-message" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                    <Code className="text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-800">2. Enviar Mensajes</h2>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Endpoint</h3>
                        <code className="bg-gray-100 px-3 py-1 rounded text-green-700 font-mono text-sm">POST https://api.losmuchachos.es/send-message</code>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Cuerpo de la Petición (JSON)</h3>
                            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
                                <li><strong>accountId</strong>: ID de la sesión (ver en Detalles de Cuenta).</li>
                                <li><strong>recipient</strong>: Número de teléfono (con código de país, sin +).</li>
                                <li><strong>content</strong>: Texto del mensaje.</li>
                                <li><strong>mediaUrl</strong> (Opcional): URL pública de una imagen/archivo.</li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-2">Ejemplo cURL</h3>
                            <pre className="bg-slate-900 p-4 rounded-lg font-mono text-xs text-slate-300 overflow-x-auto">
                                {`curl -X POST https://api.losmuchachos.es/send-message \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: TU_API_KEY" \\
  -d '{
    "accountId": "651f...",
    "recipient": "5215551234567",
    "content": "¡Hola! Mira nuestro catálogo 📸",
    "mediaUrl": "https://tutienda.com/producto.jpg"
  }'`}
                            </pre>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. Webhooks */}
            <section id="webhooks" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                    <Webhook className="text-orange-600" />
                    <h2 className="text-xl font-bold text-gray-800">3. Webhooks (Mensajes Entrantes)</h2>
                </div>
                <div className="p-6 space-y-4">
                    <p className="text-gray-600">
                        Configura la variable de entorno <code>WEBHOOK_URL</code> en tu servidor para recibir notificaciones POST cada vez que llegue un mensaje.
                    </p>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-2">Payload Enviado a tu CRM</h3>
                        <pre className="bg-slate-900 p-4 rounded-lg font-mono text-xs text-slate-300 overflow-x-auto">
                            {`POST https://tu-crm.com/webhook
Content-Type: application/json

{
  "event": "message",
  "sessionId": "651f...",
  "data": {
    "from": "5215551234@c.us",
    "to": "5218889999@c.us",
    "body": "Hola, me interesa este producto",
    "hasMedia": false,
    "type": "chat",
    "timestamp": 1698765432,
    "pushName": "Juan Pérez"
  }
}`}
                        </pre>
                    </div>
                </div>
            </section>

            {/* 4. Gestión de Sesiones */}
            <section id="sessions" className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                    <Key className="text-purple-600" />
                    <h2 className="text-xl font-bold text-gray-800">4. Gestión de Sesiones</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Crear / Conectar Sesión</h3>
                            <code className="block bg-gray-100 px-3 py-1 rounded text-purple-700 font-mono text-sm mb-2">POST /create-session</code>
                            <p className="text-sm text-gray-600">Se usa para inicializar una sesión y generar QR. Si ya existe, fuerza la regeneración.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-1">Cerrar Sesión</h3>
                            <code className="block bg-gray-100 px-3 py-1 rounded text-red-700 font-mono text-sm mb-2">POST /delete-session</code>
                            <p className="text-sm text-gray-600">Desconecta el WhatsApp, elimina credenciales y limpia la sesión.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
