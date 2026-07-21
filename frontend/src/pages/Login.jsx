import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Wallet, ArrowRight, Lock, Mail, User } from 'lucide-react';

export default function Login() {
  const [esRegistro, setEsRegistro] = useState(false);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const { login, registro } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      if (esRegistro) {
        await registro(nombre, email, password);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(
        err.response?.data || 'Ocurrió un error. Verifica tus credenciales.'
      );
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        
        {/* Encabezado */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl mb-2">
            <Wallet className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Control de Gastos GTQ</h1>
          <p className="text-sm text-slate-400">
            {esRegistro ? 'Crea tu cuenta para administrar tus finanzas' : 'Ingresa tus credenciales para acceder'}
          </p>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {esRegistro && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Nombre Completo</label>
              <div className="relative">
                <User className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu Nombre"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@dominio.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Contraseña</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-medium rounded-xl transition duration-200 shadow-lg shadow-emerald-950 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>{cargando ? 'Procesando...' : esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}</span>
            {!cargando && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Cambiar entre Login y Registro */}
        <div className="text-center pt-2 border-t border-slate-800/80">
          <button
            onClick={() => {
              setEsRegistro(!esRegistro);
              setError('');
            }}
            className="text-xs text-slate-400 hover:text-emerald-400 transition cursor-pointer"
          >
            {esRegistro
              ? '¿Ya tienes una cuenta? Inicia sesión aquí'
              : '¿No tienes cuenta aún? Regístrate aquí'}
          </button>
        </div>

      </div>
    </div>
  );
}