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
public class TransaccionesController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TransaccionesController(ApplicationDbContext context)
    {
        _context = context;
    }

    private int ObtenerUsuarioId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TransaccionDto>>> GetTransacciones()
    {
        var usuarioId = ObtenerUsuarioId();
        var transacciones = await _context.Transacciones
            .Include(t => t.Cuenta)
            .Include(t => t.Categoria)
            .Where(t => t.UsuarioId == usuarioId)
            .OrderByDescending(t => t.Fecha)
            .Select(t => new TransaccionDto
            {
                Id = t.Id,
                CuentaId = t.CuentaId,
                NombreCuenta = t.Cuenta!.Nombre,
                CategoriaId = t.CategoriaId,
                NombreCategoria = t.Categoria!.Nombre,
                Monto = t.Monto,
                Tipo = t.Tipo,
                Fecha = t.Fecha,
                Nota = t.Nota
            })
            .ToListAsync();

        return Ok(transacciones);
    }

    [HttpPost]
    public async Task<ActionResult<TransaccionDto>> CrearTransaccion([FromBody] CrearTransaccionDto dto)
    {
        var usuarioId = ObtenerUsuarioId();

        var cuenta = await _context.Cuentas
            .FirstOrDefaultAsync(c => c.Id == dto.CuentaId && c.UsuarioId == usuarioId);

        if (cuenta == null)
            return BadRequest("La cuenta especificada no existe o no pertenece al usuario.");

        var categoria = await _context.Categorias
            .FirstOrDefaultAsync(c => c.Id == dto.CategoriaId && c.UsuarioId == usuarioId);

        if (categoria == null)
            return BadRequest("La categoría especificada no existe o no pertenece al usuario.");

        var transaccion = new Transaccion
        {
            UsuarioId = usuarioId,
            CuentaId = dto.CuentaId,
            CategoriaId = dto.CategoriaId,
            Monto = dto.Monto,
            Tipo = dto.Tipo,
            Fecha = dto.Fecha,
            Nota = dto.Nota
        };

        // Recalcular el saldo de la cuenta de origen
        if (dto.Tipo == TipoMovimiento.Ingreso)
        {
            cuenta.SaldoActual += dto.Monto;
        }
        else if (dto.Tipo == TipoMovimiento.Gasto)
        {
            cuenta.SaldoActual -= dto.Monto;
        }

        _context.Transacciones.Add(transaccion);
        await _context.SaveChangesAsync();

        return Ok(new TransaccionDto
        {
            Id = transaccion.Id,
            CuentaId = transaccion.CuentaId,
            NombreCuenta = cuenta.Nombre,
            CategoriaId = transaccion.CategoriaId,
            NombreCategoria = categoria.Nombre,
            Monto = transaccion.Monto,
            Tipo = transaccion.Tipo,
            Fecha = transaccion.Fecha,
            Nota = transaccion.Nota
        });
    }
}