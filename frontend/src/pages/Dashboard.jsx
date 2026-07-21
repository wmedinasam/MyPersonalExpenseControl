import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { formatQuetzales } from "../utils/formatters";
import ModalCuenta from "../components/ModalCuenta";
import ModalTransaccion from "../components/ModalTransaccion";
import {
  LogOut,
  Wallet,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  Building2,
  CreditCard,
  RefreshCw,
  Pencil,
  Trash2,
  Target,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import ModalPresupuesto from "../components/ModalPresupuesto";

export default function Dashboard() {
  const { usuario, logout } = useAuth();
  const [cuentas, setCuentas] = useState([]);
  const [transacciones, setTransacciones] = useState([]);
  const [modalCuentaOpen, setModalCuentaOpen] = useState(false);
  const [modalTransaccionOpen, setModalTransaccionOpen] = useState(false);
  const [cargando, setCargando] = useState(true);

  const [transaccionAEditar, setTransaccionAEditar] = useState(null);

  const [presupuestos, setPresupuestos] = useState([]);
  const [modalPresupuestoOpen, setModalPresupuestoOpen] = useState(false);
  const [presupuestoAEditar, setPresupuestoAEditar] = useState(null);


  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [resCuentas, resTrans, resPresupuestos] = await Promise.all([
        api.get("/cuentas"),
        api.get("/transacciones"),
        api.get("/presupuestos"),
      ]);
      setCuentas(resCuentas.data);
      setTransacciones(resTrans.data);
      setPresupuestos(resPresupuestos.data);
    } catch {
      console.error("Error al cargar datos financieros");
    } finally {
      setCargando(false);
    }
  };

  const handleEliminarTransaccion = async (id) => {
    if (
      !window.confirm(
        "¿Estás seguro de eliminar esta transacción? El saldo de la cuenta se revertirá.",
      )
    )
      return;

    try {
      await api.delete(`/transacciones/${id}`);
      cargarDatos();
    } catch (err) {
      alert("Error al eliminar la transacción");
    }
  };

  const handleEliminarPresupuesto = async (id) => {
    if (
      !window.confirm(
        "¿Estás seguro de eliminar este presupuesto?",
      )
    )
      return;

    try {
      await api.delete(`/presupuestos/${id}`);
      cargarDatos();
    } catch (err) {
      alert("Error al eliminar el presupuesto");
    }
  };  

  useEffect(() => {
    cargarDatos();
  }, []);

  const saldoTotal = cuentas.reduce((acc, c) => acc + c.saldoActual, 0);

  const totalIngresos = transacciones
    .filter((t) => t.tipo === 0)
    .reduce((acc, t) => acc + t.monto, 0);

  const totalGastos = transacciones
    .filter((t) => t.tipo === 1)
    .reduce((acc, t) => acc + t.monto, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-12">
      {/* Navbar Superior */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="font-bold tracking-tight text-lg">
              Finanzas GTQ
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs text-slate-400">Bienvenido</p>
              <p className="text-sm font-medium text-slate-200">
                {usuario?.nombre}
              </p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Contenido Principal */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Cabecera y Botón de Acción */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Resumen Financiero
            </h1>
            <p className="text-sm text-slate-400">
              Monitorea tus saldos y movimientos en Quetzales
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={cargarDatos}
              className="p-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-300 transition cursor-pointer"
              title="Actualizar datos"
            >
              <RefreshCw
                className={`w-4 h-4 ${cargando ? "animate-spin" : ""}`}
              />
            </button>

            {cuentas.length > 0 && (
              <button
                onClick={() => setModalTransaccionOpen(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition shadow-lg shadow-emerald-950/40 flex items-center space-x-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Movimiento</span>
              </button>
            )}
          </div>
        </div>

        {/* Tarjetas de Resumen Global */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <p className="text-xs font-medium text-slate-400">
              Saldo Total Disponible
            </p>
            <p className="text-3xl font-extrabold text-emerald-400">
              {formatQuetzales(saldoTotal)}
            </p>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400">
              <ArrowUpCircle className="w-4 h-4" />
              <p className="text-xs font-medium text-slate-400">
                Ingresos Registrados
              </p>
            </div>
            <p className="text-2xl font-bold text-slate-100">
              {formatQuetzales(totalIngresos)}
            </p>
          </div>

          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-2">
            <div className="flex items-center space-x-2 text-rose-400">
              <ArrowDownCircle className="w-4 h-4" />
              <p className="text-xs font-medium text-slate-400">
                Gastos Registrados
              </p>
            </div>
            <p className="text-2xl font-bold text-slate-100">
              {formatQuetzales(totalGastos)}
            </p>
          </div>
        </div>

        {/* Sección de Cuentas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-200">
              Mis Cuentas y Wallets
            </h2>
            <button
              onClick={() => setModalCuentaOpen(true)}
              className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Cuenta</span>
            </button>
          </div>

          {cuentas.length === 0 ? (
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center space-y-4">
              <Building2 className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Aún no has registrado cuentas bancarias ni billeteras
                electrónicas.
              </p>
              <button
                onClick={() => setModalCuentaOpen(true)}
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-xl transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Primera Cuenta</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cuentas.map((c) => (
                <div
                  key={c.id}
                  className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-slate-400">
                      <CreditCard className="w-4 h-4" />
                      <span className="text-xs uppercase tracking-wider">
                        {c.nombre}
                      </span>
                    </div>
                    <p className="text-xl font-bold text-slate-100">
                      {formatQuetzales(c.saldoActual)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Historial de Últimas Transacciones */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-200">
            Últimos Movimientos
          </h2>

          {transacciones.length === 0 ? (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center text-sm text-slate-500">
              No hay transacciones registradas todavía.
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800/60 overflow-hidden">
              {transacciones.map((t) => (
                <div
                  key={t.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition group"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2.5 rounded-xl ${t.tipo === 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}
                    >
                      {t.tipo === 0 ? (
                        <ArrowUpCircle className="w-5 h-5" />
                      ) : (
                        <ArrowDownCircle className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        {t.nombreCategoria}
                      </p>
                      <p className="text-xs text-slate-400">
                        {t.nombreCuenta} {t.nota ? `• ${t.nota}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${t.tipo === 0 ? "text-emerald-400" : "text-rose-400"}`}
                      >
                        {t.tipo === 0 ? "+" : "-"}
                        {formatQuetzales(t.monto)}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {new Date(t.fecha).toLocaleDateString("es-GT")}
                      </p>
                    </div>

                    {/* Acciones Editar y Eliminar */}
                    <div className="flex items-center space-x-1 opacity-80 sm:opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => {
                          setTransaccionAEditar(t);
                          setModalTransaccionOpen(true);
                        }}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleEliminarTransaccion(t.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sección de Presupuestos */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-slate-200">
                  Presupuestos Mensuales
                </h2>
              </div>
              <button
                onClick={() => setModalPresupuestoOpen(true)}
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Presupuesto</span>
              </button>
            </div>

            {presupuestos.length === 0 ? (
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center text-sm text-slate-500">
                No has definido límites de gasto para tus categorías este mes.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {presupuestos.map((p) => {
                  const porcentaje = Math.min(
                    Math.round((p.montoConsumido / p.montoLimite) * 100),
                    100,
                  );
                  const excedido = p.montoConsumido > p.montoLimite;
                  const advertencia = porcentaje >= 80 && !excedido;

                  return (
                    <div
                      key={p.id}
                      className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-200">
                            {p.nombreCategoria}
                          </p>
                          <p className="text-xs text-slate-400">
                            {formatQuetzales(p.montoConsumido)} de{" "}
                            {formatQuetzales(p.montoLimite)}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          {excedido ? (
                            <span className="flex items-center space-x-1 text-xs font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Excedido</span>
                            </span>
                          ) : advertencia ? (
                            <span className="flex items-center space-x-1 text-xs font-semibold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Cerca del límite</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-1 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>En regla</span>
                            </span>
                          )}

                          {/* Botones de acción */}
                          <button
                            onClick={() => {
                              setPresupuestoAEditar(p);
                              setModalPresupuestoOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleEliminarPresupuesto(p.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition cursor-pointer"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Barra de Progreso */}
                      <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            excedido
                              ? "bg-rose-500"
                              : advertencia
                                ? "bg-amber-400"
                                : "bg-emerald-500"
                          }`}
                          style={{ width: `${porcentaje}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modales */}
      <ModalCuenta
        isOpen={modalCuentaOpen}
        onClose={() => setModalCuentaOpen(false)}
        onCuentaCreada={cargarDatos}
      />

      <ModalTransaccion
        isOpen={modalTransaccionOpen}
        onClose={() => {
          setModalTransaccionOpen(false);
          setTransaccionAEditar(null);
        }}
        cuentas={cuentas}
        onTransaccionCreada={cargarDatos}
        transaccionAEditar={transaccionAEditar}
      />

      <ModalPresupuesto
        isOpen={modalPresupuestoOpen}
        onClose={() => {
          setModalPresupuestoOpen(false);
          setPresupuestoAEditar(null);
        }}
        onPresupuestoGuardado={cargarDatos}
        presupuestoAEditar={presupuestoAEditar}
      />
    </div>
  );
}
