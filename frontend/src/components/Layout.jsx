import { LayoutDashboard, MessageSquare, Settings, LogOut, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout({ children }) {
    const location = useLocation();
    const { user, logout } = useAuth();

    const menuItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/messages', icon: MessageSquare, label: 'Mensajes' },
        // { path: '/docs', icon: HelpCircle, label: 'Documentación' }, // Commented out
        { path: '/settings', icon: Settings, label: 'Configuración' },
    ];

    return (
        <div className="flex h-screen bg-gray-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-sm">
                            W
                        </div>
                        <span className="text-xl font-bold text-gray-900 tracking-tight">Whatsme</span>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.label}
                                to={item.disabled ? '#' : item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                                    ? 'bg-green-50 text-green-700'
                                    : item.disabled
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <item.icon size={20} />
                                {item.label}
                                {item.disabled && <span className="ml-auto text-[10px] bg-gray-100 px-2 py-0.5 rounded-full text-gray-500">PRO</span>}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 mb-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'Usuario'}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut size={16} />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 md:px-8 justify-between">
                    <h1 className="text-xl font-semibold text-gray-800">
                        {location.pathname === '/' ? 'Panel de Control' : 'Detalles de Cuenta'}
                    </h1>
                    <div className="flex items-center gap-4">
                        <span className="flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-xs font-medium text-green-600 uppercase tracking-wider">Sistema Operativo</span>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-6 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
