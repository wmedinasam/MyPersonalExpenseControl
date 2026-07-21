import { useState, useEffect } from 'react';
import api from '../services/api';
import { X, ArrowRightLeft } from 'lucide-react';

export default function ModalTransferencia({ isOpen, onClose, cuentas, onTransferenciaExitosa }) {
  const [origenId, setOrigenId] = useState('');
  const [destinoId, setDestinoId] = useState('');
  const [monto, setMonto] = useState('');
  const [nota, setNota] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && cuentas.length >= 2) {
      setOrigenId(cuentas[0].id.toString());
      setDestinoId(cuentas[1].id.toString());
    }
  }, [isOpen, cuentas]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (origenId === destinoId) {
      setError('Las cuentas de origen y destino no pueden ser iguales.');
      return;
    }

    setCargando(true);

    try {
      await api.post('/transferencias', {
        cuentaOrigenId: parseInt(origenId),
        cuentaDestinoId: parseInt(destinoId),
        monto: parseFloat(monto),
        nota
      });
      onTransferenciaExitosa();
      onClose();
      setMonto('');
      setNota('');
    } catch (err) {
      setError(err.response?.data || 'Error al procesar la transferencia.');
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
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold">Transferencia entre Cuentas</h2>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Cuenta de Origen (Sale)</label>
            <select
              value={origenId}
              onChange={(e) => setOrigenId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-blue-500 transition"
            >
              {cuentas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} (Q {c.saldoActual.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Cuenta de Destino (Entra)</label>
            <select
              value={destinoId}
              onChange={(e) => setDestinoId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-blue-500 transition"
            >
              {cuentas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} (Q {c.saldoActual.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Monto a Transferir (GTQ - Q)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-blue-500 transition text-lg font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Nota / Concepto (Opcional)</label>
            <input
              type="text"
              placeholder="Ej. Retiro de cajero, Pago de tarjeta"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white font-medium rounded-xl transition cursor-pointer"
          >
            {cargando ? 'Transferiendo...' : 'Transferir Dinero'}
          </button>
        </form>
      </div>
    </div>
  );
}