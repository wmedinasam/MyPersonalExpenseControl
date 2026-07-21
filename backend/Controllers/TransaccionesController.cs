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

    [HttpPut("{id}")]
    public async Task<IActionResult> ActualizarTransaccion(int id, [FromBody] CrearTransaccionDto dto)
    {
        var usuarioId = ObtenerUsuarioId();

        var transaccion = await _context.Transacciones
            .FirstOrDefaultAsync(t => t.Id == id && t.UsuarioId == usuarioId);

        if (transaccion == null)
            return NotFound("Transacción no encontrada.");

        // 1. Revertir el impacto del saldo anterior en la cuenta previa
        var cuentaAnterior = await _context.Cuentas
            .FirstOrDefaultAsync(c => c.Id == transaccion.CuentaId && c.UsuarioId == usuarioId);

        if (cuentaAnterior != null)
        {
            if (transaccion.Tipo == TipoMovimiento.Ingreso)
                cuentaAnterior.SaldoActual -= transaccion.Monto;
            else
                cuentaAnterior.SaldoActual += transaccion.Monto;
        }

        // 2. Obtener la nueva cuenta asignada (o la misma si no cambió)
        var nuevaCuenta = await _context.Cuentas
            .FirstOrDefaultAsync(c => c.Id == dto.CuentaId && c.UsuarioId == usuarioId);

        if (nuevaCuenta == null)
            return BadRequest("La cuenta seleccionada no existe.");

        // 3. Aplicar el impacto del nuevo monto al saldo
        if (dto.Tipo == TipoMovimiento.Ingreso)
            nuevaCuenta.SaldoActual += dto.Monto;
        else
            nuevaCuenta.SaldoActual -= dto.Monto;

        // 4. Actualizar los campos de la transacción
        transaccion.CuentaId = dto.CuentaId;
        transaccion.CategoriaId = dto.CategoriaId;
        transaccion.Monto = dto.Monto;
        transaccion.Tipo = dto.Tipo;
        transaccion.Fecha = dto.Fecha;
        transaccion.Nota = dto.Nota;

        await _context.SaveChangesAsync();

        return Ok("Transacción actualizada exitosamente.");
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> EliminarTransaccion(int id)
    {
        var usuarioId = ObtenerUsuarioId();

        var transaccion = await _context.Transacciones
            .FirstOrDefaultAsync(t => t.Id == id && t.UsuarioId == usuarioId);

        if (transaccion == null)
            return NotFound("Transacción no encontrada.");

        // Revertir el saldo en la cuenta antes de borrar
        var cuenta = await _context.Cuentas
            .FirstOrDefaultAsync(c => c.Id == transaccion.CuentaId && c.UsuarioId == usuarioId);

        if (cuenta != null)
        {
            if (transaccion.Tipo == TipoMovimiento.Ingreso)
                cuenta.SaldoActual -= transaccion.Monto;
            else
                cuenta.SaldoActual += transaccion.Monto;
        }

        _context.Transacciones.Remove(transaccion);
        await _context.SaveChangesAsync();

        return Ok("Transacción eliminada exitosamente.");
    }
}