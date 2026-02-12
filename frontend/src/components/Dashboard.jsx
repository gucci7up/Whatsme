import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, User, Trash2, Smartphone } from 'lucide-react';
import { databases, DATABASE_ID, COLLECTION_ID } from '../lib/appwrite';
import { ID, Query } from 'appwrite';

export default function Dashboard() {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAccounts = async () => {
        try {
            const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, [
                Query.orderDesc('$createdAt')
            ]);
            setAccounts(response.documents);
        } catch (error) {
            console.error('Error fetching accounts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAccounts();
    }, []);

    const createAccount = async () => {
        const clientName = prompt('Ingrese el nombre del cliente:');
        if (!clientName) return;

        try {
            await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                client_name: clientName,
                status: 'disconnected',
                phone_number: '',
                qr_code: null,
                session_id: ID.unique() // Generate session ID for WhatsApp Engine
            });
            fetchAccounts(); // Refresh list
        } catch (error) {
            console.error('Error creating account:', error);
            alert('Error al crear cuenta');
        }
    };

    const deleteAccount = async (id, e) => {
        e.preventDefault(); // Prevent navigation
        if (!confirm('¿Estás seguro de eliminar esta cuenta?')) return;

        try {
            await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
            setAccounts(accounts.filter(acc => acc.$id !== id));
        } catch (error) {
            console.error('Error deleting account:', error);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando cuentas...</div>;

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Cuentas de WhatsApp</h2>
                <button
                    onClick={createAccount}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus size={20} />
                    Nueva Cuenta
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map((account) => (
                    <Link
                        key={account.$id}
                        to={`/account/${account.$id}`}
                        className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-shadow relative group"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-full ${account.status === 'connected' ? 'bg-green-100' : 'bg-gray-100'}`}>
                                    <User className={account.status === 'connected' ? 'text-green-600' : 'text-gray-500'} size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">{account.client_name}</h3>
                                    <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <Smartphone size={14} />
                                        {account.phone_number || 'Sin número'}
                                    </p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${account.status === 'connected'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {account.status === 'connected' ? 'Conectado' : 'Desconectado'}
                            </span>
                        </div>

                        <button
                            onClick={(e) => deleteAccount(account.$id, e)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={18} />
                        </button>
                    </Link>
                ))}

                {accounts.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 mb-2">No hay cuentas configuradas</p>
                        <p className="text-sm text-gray-400">Crea una nueva cuenta para comenzar</p>
                    </div>
                )}
            </div>
        </div>
    );
}
