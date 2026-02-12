import React, { useState, useEffect } from 'react';
import { Plus, Users, Activity, Ban } from 'lucide-react';
import { databases, client, DATABASE_ID, COLLECTION_ID } from '../lib/appwrite';
import { ID, Query } from 'appwrite';
import AccountCard from './AccountCard';
import Modal from './ui/Modal';
import CreateAccountModal from './CreateAccountModal';
import { useAuth } from '../context/AuthContext';

const ADMIN_EMAIL = 'gucci7up@gmail.com';

export default function Dashboard() {
    const { user } = useAuth();
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

        // Global Realtime Subscription for Account List
        const unsubscribe = client.subscribe(
            `databases.${DATABASE_ID}.collections.${COLLECTION_ID}.documents`,
            (response) => {
                const { events, payload } = response;
                if (events.includes('databases.*.collections.*.documents.*.create')) {
                    setAccounts(prev => [payload, ...prev]);
                } else if (events.includes('databases.*.collections.*.documents.*.update')) {
                    setAccounts(prev => prev.map(acc => acc.$id === payload.$id ? payload : acc));
                } else if (events.includes('databases.*.collections.*.documents.*.delete')) {
                    setAccounts(prev => prev.filter(acc => acc.$id !== payload.$id));
                }
            }
        );

        return () => unsubscribe();
    }, []);

    const createAccount = async (clientName) => {
        try {
            await databases.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                client_name: clientName,
                status: 'disconnected',
                phone_number: '',
                qr_code: null,
                session_id: ID.unique(), // Generate session ID for WhatsApp Engine
                user_email: user.email // Assign owner
            });
            // Realtime will handle the list update
        } catch (error) {
            console.error('Error creating account:', error);
            if (error.message.includes('Attribute not found')) {
                alert('Error: Falta el atributo "user_email" en Appwrite. Contacta al admin.');
            } else {
                alert('Error al crear cuenta: ' + error.message);
            }
        }
    };

    const deleteAccount = async (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('¿Estás seguro de eliminar esta cuenta? Esta acción no se puede deshacer.')) return;

        try {
            await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, id);
            // Realtime will handle the list update

            // Optional: Call Internal API to clean up sessions on Engine side if needed
            // But usually Engine cleans up or we can manual triggers
        } catch (error) {
            console.error('Error deleting account:', error);
        }
    };

    // Filter Accounts based on Role
    const filteredAccounts = accounts.filter(account => {
        // Admin sees everything
        if (user?.email === ADMIN_EMAIL) return true;
        // User sees only their accounts
        if (account.user_email === user?.email) return true;

        // Handling legacy accounts (no user_email):
        // If user is Admin, they fall into first case (true).
        // If user is NOT Admin, they should NOT see them.
        return false;
    });

    if (loading) return <div className="p-12 text-center text-gray-500 animate-pulse">Cargando ecosistema...</div>;

    // Stats Configuration (Based on Filtered Accounts)
    const stats = [
        { label: 'Total Cuentas', value: filteredAccounts.length, icon: Users, color: 'bg-blue-100 text-blue-600' },
        { label: 'Conectadas (Online)', value: filteredAccounts.filter(a => a.status === 'connected').length, icon: Activity, color: 'bg-green-100 text-green-600' },
        { label: 'Desconectadas', value: filteredAccounts.filter(a => a.status !== 'connected').length, icon: Ban, color: 'bg-red-100 text-red-600' },
    ];

    return (
        <div>
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                            <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                        </div>
                        <div className={`p-4 rounded-lg ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Cuentas Registradas</h2>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
                >
                    <Plus size={20} />
                    Nueva Instancia
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAccounts.map((account) => (
                    <AccountCard
                        key={account.$id}
                        account={account}
                        onDelete={deleteAccount}
                    />
                ))}

                {/* Empty State Card */}
                {filteredAccounts.length === 0 && (
                    <div
                        onClick={() => setIsCreateModalOpen(true)}
                        className="col-span-full border-2 border-dashed border-gray-300 rounded-xl p-12 flex flex-col items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition-all cursor-pointer group"
                    >
                        <div className="p-4 bg-gray-100 rounded-full mb-4 group-hover:bg-white transition-colors">
                            <Plus size={32} />
                        </div>
                        <p className="text-lg font-medium">No tienes instancias activas</p>
                        <p className="text-sm">Haz clic para crear tu primera conexión de WhatsApp</p>
                    </div>
                )}
            </div>

            {/* Create Account Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Crear Nueva Instancia"
            >
                <CreateAccountModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onCreate={createAccount}
                />
            </Modal>
        </div>
    );
}
