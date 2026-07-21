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
public class CuentasController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CuentasController(ApplicationDbContext context)
    {
        _context = context;
    }

    private int ObtenerUsuarioId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CuentaDto>>> GetCuentas()
    {
        var usuarioId = ObtenerUsuarioId();
        var cuentas = await _context.Cuentas
            .Where(c => c.UsuarioId == usuarioId)
            .Select(c => new CuentaDto
            {
                Id = c.Id,
                Nombre = c.Nombre,
                Tipo = c.Tipo,
                SaldoInicial = c.SaldoInicial,
                SaldoActual = c.SaldoActual
            })
            .ToListAsync();

        return Ok(cuentas);
    }

    [HttpPost]
    public async Task<ActionResult<CuentaDto>> CrearCuenta([FromBody] CrearCuentaDto dto)
    {
        var usuarioId = ObtenerUsuarioId();

        var cuenta = new Cuenta
        {
            UsuarioId = usuarioId,
            Nombre = dto.Nombre,
            Tipo = dto.Tipo,
            SaldoInicial = dto.SaldoInicial,
            SaldoActual = dto.SaldoInicial // Al crearse, el saldo actual inicia con el inicial
        };

        _context.Cuentas.Add(cuenta);
        await _context.SaveChangesAsync();

        return Ok(new CuentaDto
        {
            Id = cuenta.Id,
            Nombre = cuenta.Nombre,
            Tipo = cuenta.Tipo,
            SaldoInicial = cuenta.SaldoInicial,
            SaldoActual = cuenta.SaldoActual
        });
    }
}