namespace backend.Models;

public class Usuario
{
    public int Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

    // Relaciones
    public ICollection<Cuenta> Cuentas { get; set; } = new List<Cuenta>();
    public ICollection<Categoria> Categorias { get; set; } = new List<Categoria>();
    public ICollection<Transaccion> Transacciones { get; set; } = new List<Transaccion>();
    public ICollection<Presupuesto> Presupuestos { get; set; } = new List<Presupuesto>();
}