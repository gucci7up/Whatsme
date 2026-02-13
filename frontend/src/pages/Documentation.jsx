import React from 'react';
import { Link } from 'react-router-dom';

export default function Documentation() {
    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Documentación</h1>
                <Link to="/" className="text-blue-600 hover:underline">
                    Volver
                </Link>
            </div>
            <div className="p-6 bg-white rounded-lg shadow">
                <p>Cargando documentación...</p>
                {/* 
                   Temporary debug: If this renders, the crash was caused by Lucide icons. 
                   We will restore content one by one.
                */}
            </div>
        </div>
    );
}
