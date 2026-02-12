import React from 'react';
import { Link } from 'react-router-dom';
import { User, Smartphone, Trash2, ExternalLink, QrCode, Power } from 'lucide-react';

export default function AccountCard({ account, onDelete }) {
    const isConnected = account.status === 'connected';

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 group relative flex flex-col h-full">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${isConnected ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {isConnected ? <Smartphone size={24} /> : <QrCode size={24} />}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${isConnected
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {isConnected ? 'Activo' : 'Desconectado'}
                </span>
            </div>

            <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1" title={account.client_name}>
                {account.client_name}
            </h3>

            <div className="text-sm text-gray-500 mb-6 flex items-center gap-1.5 font-mono bg-gray-50 px-2 py-1 rounded self-start">
                <span className="text-xs text-gray-400">ID:</span> {account.$id.substring(0, 8)}...
            </div>

            <div className="mt-auto flex gap-3 pt-4 border-t border-gray-100">
                <Link
                    to={`/account/${account.$id}`}
                    className="flex-1 bg-gray-900 hover:bg-black text-white text-sm font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                    <ExternalLink size={16} />
                    Gestionar
                </Link>
                <button
                    onClick={(e) => onDelete(account.$id, e)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar Cuenta"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
}
