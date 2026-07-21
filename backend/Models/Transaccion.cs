namespace backend.Models;

public class Transaccion
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public int CuentaId { get; set; }
    public int CategoriaId { get; set; }

    public decimal Monto { get; set; } // En Quetzales (Q)
    public TipoMovimiento Tipo { get; set; }
    public DateTime Fecha { get; set; } = DateTime.Now;
    public string? Nota { get; set; }

    // Relaciones
    public Usuario? Usuario { get; set; }
    public Cuenta? Cuenta { get; set; }
    public Categoria? Categoria { get; set; }
}