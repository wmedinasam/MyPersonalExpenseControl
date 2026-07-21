namespace backend.Models;

public enum TipoMovimiento
{
    Ingreso,
    Gasto
}

public class Categoria
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public string Nombre { get; set; } = string.Empty; // Ej. "Alimentación", "Salario", "Transporte"
    public TipoMovimiento Tipo { get; set; }
    public bool Activo { get; set; } = true; // Para permitir inactivar categorías sin eliminarlas

    // Relación
    public Usuario? Usuario { get; set; }
    public ICollection<Transaccion> Transacciones { get; set; } = new List<Transaccion>();
    public ICollection<Presupuesto> Presupuestos { get; set; } = new List<Presupuesto>();
}