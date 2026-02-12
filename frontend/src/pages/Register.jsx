import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(email, password, name);
            navigate('/');
        } catch (err) {
            console.error("Registration Error:", err);
            setError(err.message || 'Error al crear cuenta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center p-4 bg-slate-900 overflow-hidden font-sans">
            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
                    alt="Background"
                    className="w-full h-full object-cover opacity-40 mix-blend-overlay"
                />
                <div className="absolute inset-0 bg-gradient-to-tl from-slate-900 via-slate-900/90 to-slate-800/80"></div>
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 w-full max-w-6xl flex flex-col md:flex-row-reverse items-center justify-between gap-12 p-6 md:p-12">

                {/* Right Side (visually): Branding */}
                <div className="w-full md:w-1/2 text-white space-y-6 text-right">
                    <div className="flex items-center justify-end gap-2 mb-4">
                        <span className="text-2xl font-bold tracking-tight">Whatsme</span>
                        <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                            <span className="font-bold text-xl">W</span>
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                        Crea tu Nueva <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-l from-orange-400 to-orange-600">
                            Cuenta
                        </span>
                    </h1>

                    <p className="text-slate-300 text-lg max-w-md ml-auto border-r-4 border-orange-500 pr-4 mt-8">
                        Únete a miles de empresas que ya automatizan su comunicación con Whatsme.
                    </p>
                </div>

                {/* Left Side (visually): Glass Form */}
                <div className="w-full md:w-[450px]">
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                        {/* Glow Effect */}
                        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>

                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-white mb-2">Registro</h2>
                            <p className="text-slate-400 text-sm">Comienza tu prueba gratuita hoy</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Nombre Completo</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                                    placeholder="Juan Pérez"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                                    placeholder="nombre@empresa.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Contraseña</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-orange-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
                            >
                                {loading && <Loader2 className="animate-spin" size={20} />}
                                {loading ? 'CREANDO CUENTA...' : 'REGISTRARSE'}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-white/5 text-center">
                            <p className="text-slate-400 text-sm">
                                ¿Ya tienes cuenta?{' '}
                                <Link to="/login" className="text-white font-semibold hover:text-orange-400 transition-colors">
                                    Inicia Sesión
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
