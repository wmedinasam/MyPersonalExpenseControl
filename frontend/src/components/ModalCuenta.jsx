import { useState } from 'react';
import api from '../services/api';
import { X, Building2 } from 'lucide-react';

export default function ModalCuenta({ isOpen, onClose, onCuentaCreada }) {
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState('0'); // 0: Banco, 1: Efectivo, 2: Tarjeta, 3: Billetera
  const [saldoInicial, setSaldoInicial] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      await api.post('/cuentas', {
        nombre,
        tipo: parseInt(tipo),
        saldoInicial: parseFloat(saldoInicial) || 0
      });
      onCuentaCreada();
      onClose();
      setNombre('');
      setSaldoInicial('');
    } catch (err) {
      setError(err.response?.data || 'Error al crear la cuenta.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-4">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Building2 className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold">Nueva Cuenta o Wallet</h2>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Nombre de la Cuenta</label>
            <input
              type="text"
              required
              placeholder="Ej. Banco Industrial, Efectivo, BI Cheques"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Tipo de Cuenta</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-emerald-500 transition"
            >
              <option value="0">Cuenta Bancaria / Monetaria</option>
              <option value="1">Efectivo</option>
              <option value="2">Tarjeta de Crédito</option>
              <option value="3">Billetera Digital / Wallet</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Saldo Inicial (GTQ - Q)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={saldoInicial}
              onChange={(e) => setSaldoInicial(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-medium rounded-xl transition cursor-pointer"
          >
            {cargando ? 'Guardando...' : 'Crear Cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
}