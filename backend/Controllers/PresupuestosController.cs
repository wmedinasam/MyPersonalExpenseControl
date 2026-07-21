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
    public async Task<ActionResult<EstadoPresupuestoDto>> CrearPresupuesto([FromBody] CrearPresupuestoDto dto)
    {
        var usuarioId = ObtenerUsuarioId();

        var categoria = await _context.Categorias
            .FirstOrDefaultAsync(c => c.Id == dto.CategoriaId && c.UsuarioId == usuarioId);

        if (categoria == null)
            return BadRequest("Categoría inválida.");

        var presupuesto = new Presupuesto
        {
            UsuarioId = usuarioId,
            CategoriaId = dto.CategoriaId,
            MontoLimite = dto.MontoLimite,
            Periodo = dto.Periodo,
            FechaInicio = dto.FechaInicio,
            FechaFin = dto.FechaFin
        };

        _context.Presupuestos.Add(presupuesto);
        await _context.SaveChangesAsync();

        return Ok(new EstadoPresupuestoDto
        {
            Id = presupuesto.Id,
            CategoriaId = presupuesto.CategoriaId,
            NombreCategoria = categoria.Nombre,
            MontoLimite = presupuesto.MontoLimite,
            MontoConsumido = 0,
            Periodo = presupuesto.Periodo,
            FechaInicio = presupuesto.FechaInicio,
            FechaFin = presupuesto.FechaFin
        });
    }
}