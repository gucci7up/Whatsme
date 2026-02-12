import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Smartphone, Monitor } from 'lucide-react';
import QRCode from 'react-qr-code';
import axios from 'axios';
import { client, databases, DATABASE_ID, COLLECTION_ID } from '../lib/appwrite';

const WHATSAPP_ENGINE_URL = 'https://whatsme-engine.top'; // User needs to configure this properly later or we use relative if proxied

export default function AccountDetail() {
    const { id } = useParams();
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initial Fetch
        const fetchAccount = async () => {
            try {
                const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, id);
                setAccount(doc);
            } catch (error) {
                console.error('Error fetching account:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAccount();

        // Realtime Subscription
        console.log(`Suscribiéndose a databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents.${id}`);
        const unsubscribe = client.subscribe(
            `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents.${id}`,
            (response) => {
                console.log('Evento Realtime recibido:', response);
                if (response.events.includes('databases.*.collections.*.documents.*.update')) {
                    console.log('Actualizando cuenta con payload:', response.payload);
                    setAccount(response.payload);
                }
            }
        );

        return () => unsubscribe();
    }, [id]);

    const [connecting, setConnecting] = useState(false);

    const connectSession = async () => {
        if (!account) return;
        setConnecting(true);
        console.log('Iniciando conexión...');

        try {
            console.log('Enviando petición a https://api.losmuchachos.es/connect');
            await axios.post(`https://api.losmuchachos.es/connect`, {
                accountId: account.$id
            });
            alert('Petición enviada. Espera el QR...');
        } catch (error) {
            console.error('Connection request failed:', error);
            alert(`Error de conexión: ${error.message}. Revisa la consola.`);
        } finally {
            setConnecting(false);
        }
    };

    const disconnectSession = async () => {
        if (!account) return;
        if (!confirm('¿Seguro que quieres desconectar y resetear la sesión?')) return;

        setConnecting(true);
        try {
            await axios.post(`https://api.losmuchachos.es/disconnect`, {
                accountId: account.$id
            });
            alert('Sesión reseteada. Ahora puedes generar un nuevo QR.');
        } catch (error) {
            console.error('Disconnect failed:', error);
            alert(`Error al desconectar: ${error.message}`);
        } finally {
            setConnecting(false);
        }
    };

    if (loading) return <div className="p-8 text-center">Cargando...</div>;
    if (!account) return <div className="p-8 text-center text-red-500">Cuenta no encontrada</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
                <ArrowLeft size={20} className="mr-2" />
                Volver al Dashboard
            </Link>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{account.client_name}</h1>
                        <p className="text-sm text-gray-500">ID: {account.$id}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${account.status === 'connected'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {account.status === 'connected' ? 'Conectado' : 'Desconectado'}
                    </span>
                </div>

                <div className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* QR Section */}
                        <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-xl border border-gray-200">
                            {account.status === 'connected' ? (
                                <div className="text-center">
                                    <div className="bg-green-100 p-4 rounded-full inline-block mb-4">
                                        <Smartphone size={48} className="text-green-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-green-700 mb-2">¡WhatsApp Conectado!</h3>
                                    <p className="text-gray-600 mb-6">El dispositivo está listo para enviar mensajes.</p>

                                    <button
                                        onClick={disconnectSession}
                                        disabled={connecting}
                                        className="text-red-600 hover:text-red-700 font-medium text-sm underline"
                                    >
                                        {connecting ? 'Desconectando...' : 'Desconectar / Resetear Sesión'}
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {account.qr_code ? (
                                        <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col items-center">
                                            <img src={account.qr_code} alt="Scan QR" className="w-64 h-64 mb-4" />
                                            <button
                                                onClick={disconnectSession}
                                                disabled={connecting}
                                                className="text-red-500 hover:text-red-600 text-xs underline"
                                            >
                                                ¿QR Caducado? Generar nuevo
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="bg-gray-200 p-4 rounded-full inline-block mb-4">
                                                <Monitor size={48} className="text-gray-400" />
                                            </div>
                                            <p className="text-gray-500 mb-4">QR no disponible</p>
                                            <button
                                                onClick={connectSession}
                                                disabled={connecting}
                                                className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 mx-auto transition-colors ${connecting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <RefreshCw size={18} className={connecting ? 'animate-spin' : ''} />
                                                {connecting ? 'Conectando...' : 'Generar QR'}
                                            </button>
                                        </div>
                                    )}
                                    {account.status === 'scanning' && (
                                        <p className="mt-4 text-sm text-gray-500 animate-pulse">
                                            Escanea el código con tu WhatsApp...
                                        </p>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Info / Test Section */}
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información de la Sesión</h3>
                                <div className="bg-gray-50 rounded-lg p-4 space-y-3 font-mono text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Estado:</span>
                                        <span className="font-medium text-gray-900">{account.status}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Última Act.:</span>
                                        <span className="font-medium text-gray-900">
                                            {new Date(account.$updatedAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Teléfono:</span>
                                        <span className="font-medium text-gray-900">{account.phone_number || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
