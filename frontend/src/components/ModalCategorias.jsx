import { useState, useEffect } from 'react';
import api from '../services/api';
import { X, Tag, Plus, Pencil, Power, Check } from 'lucide-react';

export default function ModalCategorias({ isOpen, onClose, onCategoriasCambiadas }) {
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState('');
  const [tipo, setTipo] = useState(1); // 1: Gasto, 0: Ingreso
  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [estadoCargandoId, setEstadoCargandoId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      cargarCategorias();
    }
  }, [isOpen]);

  // Auto-limpiar error después de 4 segundos
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const cargarCategorias = async () => {
    try {
      // Solicitamos todas las categorías (incluyendo inactivas)
      const res = await api.get('/categorias?soloActivas=false');
      setCategorias(res.data);
    } catch {
      setError('Error al cargar categorías.');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      if (editandoId) {
        await api.put(`/categorias/${editandoId}`, {
          nombre,
          tipo: parseInt(tipo)
        });
      } else {
        await api.post('/categorias', {
          nombre,
          tipo: parseInt(tipo)
        });
      }
      setNombre('');
      setEditandoId(null);
      cargarCategorias();
      onCategoriasCambiadas();
    } catch (err) {
      setError(err.response?.data || 'Error al guardar la categoría.');
    } finally {
      setCargando(false);
    }
  };

  const iniciarEdicion = (cat) => {
    setEditandoId(cat.id);
    setNombre(cat.nombre);
    setTipo(cat.tipo);
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setNombre('');
  };

  const toggleEstado = async (id) => {
    setEstadoCargandoId(id);
    setError('');
    try {
      await api.patch(`/categorias/${id}/estado`);
      await cargarCategorias();
      onCategoriasCambiadas();
    } catch (err) {
      setError(err.response?.data || 'No se puede cambiar el estado de esta categoría.');
    } finally {
      setEstadoCargandoId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative space-y-5 max-h-[90vh] flex flex-col">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl">
              <Tag className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold">Gestión de Categorías</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
            {error}
          </div>
        )}

        {/* Formulario para Agregar/Editar */}
        <form onSubmit={handleSubmit} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
            <span>{editandoId ? 'Editar Categoría' : 'Nueva Categoría'}</span>
            {editandoId && (
              <button type="button" onClick={cancelarEdicion} className="text-rose-400 hover:underline">
                Cancelar
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              required
              placeholder="Ej. Mascotas, Gimnasio"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-purple-500 transition"
            />

            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-purple-500 transition"
            >
              <option value="1">Gasto</option>
              <option value="0">Ingreso</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl text-xs transition cursor-pointer flex items-center justify-center space-x-1"
          >
            {editandoId ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{editandoId ? 'Guardar Cambios' : 'Agregar Categoría'}</span>
          </button>
        </form>

        {/* Listado de Categorías */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {categorias.map((cat) => (
            <div 
              key={cat.id} 
              className={`p-3 rounded-xl border flex items-center justify-between transition ${
                cat.activo 
                  ? 'bg-slate-900/50 border-slate-800' 
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  cat.tipo === 1 ? 'bg-rose-500/10 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {cat.tipo === 1 ? 'Gasto' : 'Ingreso'}
                </span>
                <span className={`text-sm font-medium ${!cat.activo && 'line-through text-slate-500'}`}>
                  {cat.nombre}
                </span>
                {cat.esSistema && (
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                    Sistema
                  </span>
                )}
              </div>

              {!cat.esSistema && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => iniciarEdicion(cat)}
                    className="p-1.5 text-slate-400 hover:text-purple-400 hover:bg-slate-800 rounded-lg transition"
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => toggleEstado(cat.id)}
                    disabled={estadoCargandoId === cat.id}
                    className={`p-1.5 rounded-lg transition ${
                      estadoCargandoId === cat.id
                        ? 'opacity-50 cursor-not-allowed'
                        : cat.activo 
                        ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-800' 
                        : 'text-emerald-500 hover:text-emerald-400 hover:bg-slate-800'
                    }`}
                    title={cat.activo ? 'Inactivar' : 'Activar'}
                  >
                    <Power className={`w-3.5 h-3.5 ${
                      estadoCargandoId === cat.id ? 'animate-spin' : ''
                    }`} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}