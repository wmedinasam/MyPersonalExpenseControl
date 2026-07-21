using backend.Models;
namespace backend.DTOs;
public class CrearCategoriaDto
{
    public string Nombre { get; set; } = string.Empty;
    public TipoMovimiento Tipo { get; set; } // 0: Ingreso, 1: Gasto
}