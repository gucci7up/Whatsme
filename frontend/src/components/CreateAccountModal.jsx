import React, { useState } from 'react';
import { database } from 'lucide-react'; // Fallback icon

export default function CreateAccountModal({ isOpen, onClose, onCreate }) {
    const [clientName, setClientName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!clientName.trim()) return;

        setIsSubmitting(true);
        try {
            await onCreate(clientName);
            setClientName('');
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Cliente / Referencia
                </label>
                <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Ej. Tienda Principal, Vendedor 1..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                    autoFocus
                />
                <p className="mt-1 text-xs text-gray-500">
                    Este nombre es solo para identificar la cuenta en el panel.
                </p>
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={isSubmitting || !clientName.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    {isSubmitting ? 'Creando...' : 'Crear Cuenta'}
                </button>
            </div>
        </form>
    );
}
