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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none text-green-600 font-semibold"
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

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="space-y-8">
                            {/* Change Password */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Cambiar Contraseña</h2>
                                <PasswordForm />
                            </div>

                            {/* Active Sessions */}
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 border-b pb-2 mb-4">Sesiones Activas</h2>
                                <SessionsList />
                            </div>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                        <div className="space-y-6">
                            <h2 className="text-lg font-semibold text-gray-900 border-b pb-2">Preferencias de Notificaciones</h2>
                            <p className="text-sm text-gray-500">Elige cómo quieres recibir las alertas de actividad en tu cuenta.</p>
                            <NotificationsForm />
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

// Sub-components
import { Laptop, Smartphone, Trash2 } from 'lucide-react';

function PasswordForm() {
    const { updatePassword } = useAuth();
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updatePassword(newPassword, oldPassword);
            alert('Contraseña actualizada correctamente');
            setOldPassword('');
            setNewPassword('');
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 outline-none"
                    minLength={8}
                    required
                />
            </div>
            <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
                {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
            </button>
        </form>
    );
}

function SessionsList() {
    const { getSessions, deleteSession } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    React.useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            const list = await getSessions();
            setSessions(list.sessions);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogoutSession = async (sessionId) => {
        if (!confirm('¿Cerrar sesión en este dispositivo?')) return;
        try {
            await deleteSession(sessionId);
            loadSessions();
        } catch (error) {
            alert('Error al cerrar sesión');
        }
    };

    if (loading) return <div className="text-sm text-gray-500">Cargando sesiones...</div>;

    return (
        <div className="space-y-3">
            {sessions.map(session => (
                <div key={session.$id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-gray-200 text-gray-500">
                            {session.deviceType === 'desktop' ? <Laptop size={20} /> : <Smartphone size={20} />}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                {session.osName} {session.osVersion} - {session.clientName}
                                {session.current && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Actual</span>}
                            </p>
                            <p className="text-xs text-gray-500">
                                IP: {session.ip} • Última actividad: {new Date(session.lastAccessed).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                    {!session.current && (
                        <button
                            onClick={() => handleLogoutSession(session.$id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cerrar sesión"
                        >
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}

function NotificationsForm() {
    const { user, updatePrefs } = useAuth();
    const [prefs, setPrefs] = useState(user.prefs || {});
    const [loading, setLoading] = useState(false);

    const handleToggle = (key) => {
        const newPrefs = { ...prefs, [key]: !prefs[key] };
        setPrefs(newPrefs);

        // Auto-save on toggle
        handleSave(newPrefs);
    };

    const handleSave = async (newPrefs) => {
        setLoading(true);
        try {
            await updatePrefs(newPrefs);
        } catch (error) {
            console.error(error);
            alert('Error al guardar preferencias');
        } finally {
            setLoading(false);
        }
    };

    const toggles = [
        { key: 'notify_email', label: 'Notificaciones por Email', desc: 'Recibe resúmenes semanales y alertas de seguridad.' },
        { key: 'notify_push', label: 'Notificaciones Push', desc: 'Alertas en tiempo real sobre nuevos mensajes.' },
        { key: 'notify_marketing', label: 'Novedades y Ofertas', desc: 'Mantente al día con nuevas funcionalidades.' },
    ];

    return (
        <div className="space-y-4 max-w-2xl">
            {toggles.map(toggle => (
                <div key={toggle.key} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">{toggle.label}</h3>
                        <p className="text-xs text-gray-500">{toggle.desc}</p>
                    </div>
                    <button
                        onClick={() => handleToggle(toggle.key)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${prefs[toggle.key] ? 'bg-green-600' : 'bg-gray-200'
                            }`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${prefs[toggle.key] ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                    </button>
                </div>
            ))}
            <div className="text-right">
                {loading && <span className="text-xs text-gray-400">Guardando...</span>}
            </div>
        </div>
    );
}
