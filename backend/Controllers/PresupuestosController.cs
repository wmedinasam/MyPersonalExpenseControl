using System.Security.Claims;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PresupuestosController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PresupuestosController(ApplicationDbContext context)
    {
        _context = context;
    }

    private int ObtenerUsuarioId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<EstadoPresupuestoDto>>> GetPresupuestos()
    {
        var usuarioId = ObtenerUsuarioId();

        var presupuestos = await _context.Presupuestos
            .Include(p => p.Categoria)
            .Where(p => p.UsuarioId == usuarioId)
            .ToListAsync();

        var resultado = new List<EstadoPresupuestoDto>();

        foreach (var p in presupuestos)
        {
            // Sumar los gastos acumulados en esa categoría durante el rango del presupuesto
            var consumido = await _context.Transacciones
                .Where(t => t.UsuarioId == usuarioId
                         && t.CategoriaId == p.CategoriaId
                         && t.Tipo == TipoMovimiento.Gasto
                         && t.Fecha >= p.FechaInicio
                         && t.Fecha <= p.FechaFin)
                .SumAsync(t => (decimal?)t.Monto) ?? 0m;

            resultado.Add(new EstadoPresupuestoDto
            {
                Id = p.Id,
                CategoriaId = p.CategoriaId,
                NombreCategoria = p.Categoria!.Nombre,
                MontoLimite = p.MontoLimite,
                MontoConsumido = consumido,
                Periodo = p.Periodo,
                FechaInicio = p.FechaInicio,
                FechaFin = p.FechaFin
            });
        }

        return Ok(resultado);
    }

    [HttpPost]
    public async Task<IActionResult> GuardarPresupuesto([FromBody] CrearPresupuestoDto dto)
    {
        var usuarioId = ObtenerUsuarioId();

        var presupuestoExistente = await _context.Presupuestos
            .FirstOrDefaultAsync(p => p.UsuarioId == usuarioId && p.CategoriaId == dto.CategoriaId);

        // Calcular fechas si no se proporcionan
        var ahora = DateTime.Now;
        var fechaInicio = new DateTime(ahora.Year, ahora.Month, 1);
        var fechaFin = fechaInicio.AddMonths(1).AddDays(-1);

        if (presupuestoExistente != null)
        {
            presupuestoExistente.MontoLimite = dto.MontoLimite;
            presupuestoExistente.Periodo = dto.Periodo != default ? dto.Periodo : PeriodoPresupuesto.Mensual;
            presupuestoExistente.FechaInicio = dto.FechaInicio != default ? dto.FechaInicio : fechaInicio;
            presupuestoExistente.FechaFin = dto.FechaFin != default ? dto.FechaFin : fechaFin;
        }
        else
        {
            _context.Presupuestos.Add(new Presupuesto
            {
                UsuarioId = usuarioId,
                CategoriaId = dto.CategoriaId,
                MontoLimite = dto.MontoLimite,
                Periodo = dto.Periodo != default ? dto.Periodo : PeriodoPresupuesto.Mensual,
                FechaInicio = dto.FechaInicio != default ? dto.FechaInicio : fechaInicio,
                FechaFin = dto.FechaFin != default ? dto.FechaFin : fechaFin
            });
        }

        await _context.SaveChangesAsync();
        return Ok("Presupuesto guardado correctamente.");
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> ActualizarPresupuesto(int id, [FromBody] CrearPresupuestoDto dto)
    {
        var usuarioId = ObtenerUsuarioId();
        var presupuesto = await _context.Presupuestos
            .FirstOrDefaultAsync(p => p.Id == id && p.UsuarioId == usuarioId);

        if (presupuesto == null)
            return NotFound("Presupuesto no encontrado.");

        presupuesto.MontoLimite = dto.MontoLimite;
        presupuesto.Periodo = dto.Periodo != default ? dto.Periodo : presupuesto.Periodo;
        presupuesto.FechaInicio = dto.FechaInicio != default ? dto.FechaInicio : presupuesto.FechaInicio;
        presupuesto.FechaFin = dto.FechaFin != default ? dto.FechaFin : presupuesto.FechaFin;

        await _context.SaveChangesAsync();
        return Ok("Presupuesto actualizado correctamente.");
    }
    // DELETE: api/presupuestos/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> EliminarPresupuesto(int id)
    {
        var usuarioId = ObtenerUsuarioId();
        var presupuesto = await _context.Presupuestos
            .FirstOrDefaultAsync(p => p.Id == id && p.UsuarioId == usuarioId);

        if (presupuesto == null) return NotFound("Presupuesto no encontrado.");

        _context.Presupuestos.Remove(presupuesto);
        await _context.SaveChangesAsync();

        return Ok("Presupuesto eliminado.");
    }

    public class CrearPresupuestoDto
    {
        public int CategoriaId { get; set; }
        public decimal MontoLimite { get; set; } 
        public PeriodoPresupuesto Periodo { get; set; }
        public DateTime FechaInicio { get; set; }
        public DateTime FechaFin { get; set; }
        
    }
}