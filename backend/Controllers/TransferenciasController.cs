using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using backend.Data;
using backend.DTOs;

namespace MyPersonalExpenseControl.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TransferenciasController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TransferenciasController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int ObtenerUsuarioId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        [HttpPost]
        public async Task<IActionResult> RealizarTransferencia([FromBody] CrearTransferenciaDto dto)
        {
            var usuarioId = ObtenerUsuarioId();

            if (dto.CuentaOrigenId == dto.CuentaDestinoId)
                return BadRequest("La cuenta de origen y destino deben ser diferentes.");

            if (dto.Monto <= 0)
                return BadRequest("El monto debe ser mayor a 0.");

            // Usar transacción de base de datos para garantizar la integridad
            using var dbTransaction = await _context.Database.BeginTransactionAsync();

            try
            {
                var origen = await _context.Cuentas
                    .FirstOrDefaultAsync(c => c.Id == dto.CuentaOrigenId && c.UsuarioId == usuarioId);

                var destino = await _context.Cuentas
                    .FirstOrDefaultAsync(c => c.Id == dto.CuentaDestinoId && c.UsuarioId == usuarioId);

                if (origen == null || destino == null)
                    return NotFound("Una de las cuentas seleccionadas no existe.");

                if (origen.SaldoActual < dto.Monto)
                    return BadRequest("Saldo insuficiente en la cuenta de origen.");

                // Actualizar saldos
                origen.SaldoActual -= dto.Monto;
                destino.SaldoActual += dto.Monto;

                await _context.SaveChangesAsync();
                await dbTransaction.CommitAsync();

                return Ok("Transferencia realizada exitosamente.");
            }
            catch
            {
                await dbTransaction.RollbackAsync();
                return StatusCode(500, "Error al procesar la transferencia.");
            }
        }
    }
}