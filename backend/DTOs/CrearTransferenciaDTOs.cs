namespace backend.DTOs;
public class CrearTransferenciaDto
{
    public int CuentaOrigenId { get; set; }
    public int CuentaDestinoId { get; set; }
    public decimal Monto { get; set; }
    public string? Nota { get; set; }
}