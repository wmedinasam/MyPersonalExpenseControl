using backend.Models;

namespace backend.DTOs;

// --- CUENTAS ---
public class CrearCuentaDto
{
    public string Nombre { get; set; } = string.Empty;
    public TipoCuenta Tipo { get; set; }
    public decimal SaldoInicial { get; set; }
}

public class CuentaDto
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public TipoCuenta Tipo { get; set; }
    public decimal SaldoInicial { get; set; }
    public decimal SaldoActual { get; set; }
}

// --- TRANSACCIONES ---
public class CrearTransaccionDto
{
    public int CuentaId { get; set; }
    public int CategoriaId { get; set; }
    public decimal Monto { get; set; }
    public TipoMovimiento Tipo { get; set; }
    public DateTime Fecha { get; set; } = DateTime.Now;
    public string? Nota { get; set; }
}

public class TransaccionDto
{
    public int Id { get; set; }
    public int CuentaId { get; set; }
    public string NombreCuenta { get; set; } = string.Empty;
    public int CategoriaId { get; set; }
    public string NombreCategoria { get; set; } = string.Empty;
    public decimal Monto { get; set; }
    public TipoMovimiento Tipo { get; set; }
    public DateTime Fecha { get; set; }
    public string? Nota { get; set; }
}

// --- PRESUPUESTOS ---
public class CrearPresupuestoDto
{
    public int CategoriaId { get; set; }
    public decimal MontoLimite { get; set; }
    public PeriodoPresupuesto Periodo { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
}

public class EstadoPresupuestoDto
{
    public int Id { get; set; }
    public int CategoriaId { get; set; }
    public string NombreCategoria { get; set; } = string.Empty;
    public decimal MontoLimite { get; set; }
    public decimal MontoConsumido { get; set; }
    public decimal PorcentajeConsumido => MontoLimite > 0 ? (MontoConsumido / MontoLimite) * 100 : 0;
    public PeriodoPresupuesto Periodo { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }
}