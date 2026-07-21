namespace backend.Models;

public enum PeriodoPresupuesto
{
    Semanal,
    Mensual
}

public class Presupuesto
{
    public int Id { get; set; }
    public int UsuarioId { get; set; }
    public int CategoriaId { get; set; }

    public decimal MontoLimite { get; set; } // Límite en Quetzales
    public PeriodoPresupuesto Periodo { get; set; }
    public DateTime FechaInicio { get; set; }
    public DateTime FechaFin { get; set; }

    // Relaciones
    public Usuario? Usuario { get; set; }
    public Categoria? Categoria { get; set; }
}