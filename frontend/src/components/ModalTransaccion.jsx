// 1. Imports
import { useState, useEffect } from 'react';
import api from '../services/api';
import { X, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// 2. Component
export default function ModalTransaccion({ isOpen, onClose, cuentas, onTransaccionCreada, transaccionAEditar = null }) {
  // 3. States
  const [tipo, setTipo] = useState(1);
  const [cuentaId, setCuentaId] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [monto, setMonto] = useState('');
  const [nota, setNota] = useState('');
  const [fecha, setFecha] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // 4. Helpers
  const formatFechaInput = (fechaISO) => {
    if (!fechaISO) return '';
    return fechaISO.split('T')[0];
  };

  const fechaToISO = (fechaInput) => {
    if (!fechaInput) return new Date().toISOString();
    return new Date(fechaInput + 'T00:00:00').toISOString();
  };

  // 5. Función cargarCategorias (función normal)
  const cargarCategorias = async () => {
    try {
      console.log('Cargando categorías...');
      const res = await api.get('/categorias?soloActivas=true');
      console.log('Categorías cargadas:', res.data);
      setCategorias(res.data);
      if (!transaccionAEditar && res.data.length > 0) {
        setCategoriaId(res.data[0].id.toString());
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al obtener categorías.');
    }
  };

  // 6. useEffects
  useEffect(() => {
    if (isOpen) {
      cargarCategorias();
    }
  }, [isOpen]);

  useEffect(() => {
    if (transaccionAEditar) {
      setTipo(transaccionAEditar.tipo);
      setCuentaId(transaccionAEditar.cuentaId.toString());
      setCategoriaId(transaccionAEditar.categoriaId.toString());
      setMonto(transaccionAEditar.monto.toString());
      setNota(transaccionAEditar.nota || '');
      setFecha(formatFechaInput(transaccionAEditar.fecha));
    } else {
      setTipo(1);
      if (cuentas.length > 0) setCuentaId(cuentas[0].id.toString());
      setMonto('');
      setNota('');
      setFecha(formatFechaInput(new Date().toISOString()));
    }
  }, [transaccionAEditar, isOpen, cuentas]);

  // Sincronizar categoriaId cuando cambia el tipo de movimiento
  useEffect(() => {
    if (!transaccionAEditar && categorias.length > 0) {
      const categoriaDelTipo = categorias.find(c => c.tipo === tipo);
      if (categoriaDelTipo) {
        setCategoriaId(categoriaDelTipo.id.toString());
      }
    }
  }, [tipo, categorias, transaccionAEditar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    const payload = {
      cuentaId: parseInt(cuentaId),
      categoriaId: parseInt(categoriaId),
      monto: parseFloat(monto),
      tipo: parseInt(tipo),
      fecha: fechaToISO(fecha),
      nota
    };

    try {
      if (transaccionAEditar) {
        await api.put(`/transacciones/${transaccionAEditar.id}`, payload);
      } else {
        await api.post('/transacciones', payload);
      }
      onTransaccionCreada();
      onClose();
    } catch (err) {
      setError(err.response?.data || 'Error al procesar la transacción.');
    } finally {
      setCargando(false);
    }
  };

  const categoriasFiltradas = categorias.filter(c => c.tipo === parseInt(tipo));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-4">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold">
          {transaccionAEditar ? 'Editar Movimiento' : 'Registrar Movimiento'}
        </h2>

        {/* Selector de Tipo (Gasto vs Ingreso) */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => setTipo(1)}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1 transition cursor-pointer ${
              tipo === 1 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'text-slate-400'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Gasto</span>
          </button>

          <button
            type="button"
            onClick={() => setTipo(0)}
            className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1 transition cursor-pointer ${
              tipo === 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Ingreso</span>
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Cuenta</label>
            <select
              value={cuentaId}
              onChange={(e) => setCuentaId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-emerald-500 transition"
            >
              {cuentas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre} (Q {c.saldoActual.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Categoría</label>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-emerald-500 transition"
            >
              {categoriasFiltradas.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Monto (GTQ - Q)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-emerald-500 transition text-lg font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Fecha</label>
            <input
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Ej. Supermercado, Gasolina"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className={`w-full py-2.5 font-medium rounded-xl transition cursor-pointer text-white ${
              tipo === 1 ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
            }`}
          >
            {cargando ? 'Procesando...' : transaccionAEditar ? 'Guardar Cambios' : tipo === 1 ? 'Registrar Gasto' : 'Registrar Ingreso'}
          </button>
        </form>
      </div>
    </div>
  );
}