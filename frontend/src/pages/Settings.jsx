import React, { useState } from 'react';
import { Save, User, Globe, Shield, Bell, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');

    // Form States
    const [appName, setAppName] = useState('Whatsme SaaS');
    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [favicon, setFavicon] = useState(null);
    const [faviconPreview, setFaviconPreview] = useState(null);

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogo(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleFaviconChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFavicon(file);
            setFaviconPreview(URL.createObjectURL(file));
        }
    };

    const handleSaveConfig = (e) => {
        e.preventDefault();
        // Here we would upload to Appwrite Storage and update a System Config collection
        alert('Configuración guardada (Simulado)');
    };

    const tabs = [
        { id: 'profile', label: 'Mi Perfil', icon: User },
        { id: 'app', label: 'Configuración App', icon: Globe },
        { id: 'security', label: 'Seguridad', icon: Shield },
        { id: 'notifications', label: 'Notificaciones', icon: Bell },
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <SettingsIcon className="w-8 h-8 text-gray-600" /> Configuración
            </h1>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 border-r border-gray-200 bg-gray-50">
                    <nav className="p-4 space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                                        ? 'bg-white text-green-600 shadow-sm ring-1 ring-gray-200'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Información Personal</h2>
                            <div className="flex items-center gap-4">
                                <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <button className="text-sm text-green-600 font-medium hover:text-green-700">Cambiar Avatar</button>
                                    <p className="text-xs text-gray-500 mt-1">JPG, GIF o PNG. Max 1MB.</p>
                                </div>
                            </div>

                            <form className="space-y-4 max-w-md">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                    <input
                                        type="text"
                                        defaultValue={user?.name}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
                                        readOnly // Appwrite user update logic needed
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                                    <input
                                        type="email"
                                        defaultValue={user?.email}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                                        readOnly
                                    />
                                </div>
                            </form>
                        </div>
                    )}

                    {/* App Config Tab (Requested Logo/Favicon) */}
                    {activeTab === 'app' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Personalización de Marca</h2>
                            <p className="text-sm text-gray-500">Personaliza la apariencia de tu instancia SaaS.</p>

                            <form onSubmit={handleSaveConfig} className="space-y-6 max-w-lg">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Aplicación</label>
                                    <input
                                        type="text"
                                        value={appName}
                                        onChange={(e) => setAppName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
                                    />
                                </div>

                                {/* Logo Upload */}
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors">
                                    <label className="cursor-pointer flex flex-col items-center">
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo Preview" className="h-16 object-contain mb-2" />
                                        ) : (
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                                                <Upload size={24} className="text-gray-400" />
                                            </div>
                                        )}
                                        <span className="text-sm font-medium text-gray-700">{logo ? 'Cambiar Logo' : 'Subir Logo Principal'}</span>
                                        <span className="text-xs text-gray-400 mt-1">Recomendado: 200x50px PNG transparente</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                                    </label>
                                </div>

                                {/* Favicon Upload */}
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex items-center gap-6 hover:bg-gray-50 transition-colors">
                                    <div className="w-12 h-12 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                                        {faviconPreview ? (
                                            <img src={faviconPreview} alt="Favicon" className="w-8 h-8 object-contain" />
                                        ) : (
                                            <Globe size={24} className="text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <label className="cursor-pointer">
                                            <span className="text-sm font-medium text-green-600 hover:text-green-700">Subir Favicon</span>
                                            <input type="file" className="hidden" accept="image/x-icon,image/png" onChange={handleFaviconChange} />
                                        </label>
                                        <p className="text-xs text-gray-500 mt-1">Icono para la pestaña del navegador (32x32px).</p>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    Guardar Cambios
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Placeholders for other tabs */}
                    {(activeTab === 'security' || activeTab === 'notifications') && (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                            <Shield size={48} className="mb-4 text-gray-200" />
                            <p>Configuración no disponible en esta versión demo.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SettingsIcon({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
    );
}
