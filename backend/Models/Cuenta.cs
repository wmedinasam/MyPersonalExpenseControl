namespace backend.Models;

public enum TipoCuenta
{
    Banco,
    Efectivo,
    BilleteraDigital // ej. Fri, Neo-bancos, etc.
}

public class Cuenta
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public string Nombre { get; set; } = string.Empty; // Ej. "BAC Débito", "Efectivo", "Fri"
    public TipoCuenta Tipo { get; set; }
    
    // Almacena en decimal para evitar errores de redondeo en centavos de Quetzales
    public decimal SaldoInicial { get; set; }
    public decimal SaldoActual { get; set; }

    // Relación
    public Usuario? Usuario { get; set; }
    public ICollection<Transaccion> Transacciones { get; set; } = new List<Transaccion>();
}