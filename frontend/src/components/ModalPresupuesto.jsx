import { useState, useEffect } from 'react';
import api from '../services/api';
import { X, Target } from 'lucide-react';

export default function ModalPresupuesto({ isOpen, onClose, onPresupuestoGuardado, presupuestoAEditar = null }) {
  const [categoriaId, setCategoriaId] = useState('');
  const [montoLimite, setMontoLimite] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  // Helper para obtener primer y último día del mes actual
  const obtenerFechasDefault = () => {
    const hoy = new Date();
    const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
    
    return {
      inicio: primerDia.toISOString().split('T')[0],
      fin: ultimoDia.toISOString().split('T')[0]
    };
  };

  // Helper para formatear fecha ISO a input
  const formatFechaInput = (fechaISO) => {
    if (!fechaISO) return '';
    return fechaISO.split('T')[0];
  };

  useEffect(() => {
    if (isOpen) {
      cargarCategoriasDeGasto();
    }
  }, [isOpen]);

  useEffect(() => {
    if (presupuestoAEditar) {
      setCategoriaId(presupuestoAEditar.categoriaId.toString());
      setMontoLimite(presupuestoAEditar.montoLimite.toString());
      setFechaInicio(formatFechaInput(presupuestoAEditar.fechaInicio));
      setFechaFin(formatFechaInput(presupuestoAEditar.fechaFin));
    } else {
      setCategoriaId('');
      setMontoLimite('');
      const fechasDefault = obtenerFechasDefault();
      setFechaInicio(fechasDefault.inicio);
      setFechaFin(fechasDefault.fin);
    }
  }, [presupuestoAEditar, isOpen]);

  const cargarCategoriasDeGasto = async () => {
    try {
      const res = await api.get('/categorias');
      // Filtrar solo categorías de Gasto (tipo === 1)
      const gastosCat = res.data.filter(c => c.tipo === 1);
      setCategorias(gastosCat);
      if (!presupuestoAEditar && gastosCat.length > 0) setCategoriaId(gastosCat[0].id.toString());
    } catch {
      setError('Error al obtener categorías.');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const payload = {
        categoriaId: parseInt(categoriaId),
        montoLimite: parseFloat(montoLimite),
        periodo: 1, // Mensual
        fechaInicio: new Date(fechaInicio + 'T00:00:00').toISOString(),
        fechaFin: new Date(fechaFin + 'T00:00:00').toISOString()
      };
      
      if (presupuestoAEditar) {
        await api.put(`/presupuestos/${presupuestoAEditar.id}`, payload);
      } else {
        await api.post('/presupuestos', payload);
      }
      onPresupuestoGuardado();
      onClose();
      setMontoLimite('');
    } catch (err) {
      setError(err.response?.data || 'Error al guardar el presupuesto.');
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
            <Target className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold">{presupuestoAEditar ? 'Editar Presupuesto' : 'Asignar Presupuesto Mensual'}</h2>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Categoría de Gasto</label>
            <select
              value={categoriaId}
              onChange={(e) => setCategoriaId(e.target.value)}
              disabled={presupuestoAEditar !== null}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-emerald-500 transition disabled:opacity-50"
            >
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Límite Mensual (GTQ - Q)</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="Ej. 1500.00"
              value={montoLimite}
              onChange={(e) => setMontoLimite(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-emerald-500 transition text-lg font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Fecha Inicio</label>
              <input
                type="date"
                required
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Fecha Fin</label>
              <input
                type="date"
                required
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-emerald-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white font-medium rounded-xl transition cursor-pointer"
          >
            {cargando ? 'Guardando...' : presupuestoAEditar ? 'Guardar Cambios' : 'Establecer Presupuesto'}
          </button>
        </form>
      </div>
    </div>
  );
}