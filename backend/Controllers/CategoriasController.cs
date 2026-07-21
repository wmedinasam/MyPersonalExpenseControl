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
public class CategoriasController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public CategoriasController(ApplicationDbContext context)
    {
        _context = context;
    }

    private int ObtenerUsuarioId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Categoria>>> GetCategorias([FromQuery] bool soloActivas)
    {
        var usuarioId = ObtenerUsuarioId();
        var categorias = await _context.Categorias
            .Where(c => c.UsuarioId == usuarioId)
            .ToListAsync();
        
        if (soloActivas)
        {
            categorias = categorias.Where(c => c.Activo).ToList();
        }

        return Ok(categorias);
    }

    // POST: api/categorias
    [HttpPost]
    public async Task<IActionResult> CrearCategoria([FromBody] CrearCategoriaDto dto)
    {
        var usuarioId = ObtenerUsuarioId();

        if (string.IsNullOrWhiteSpace(dto.Nombre))
            return BadRequest("El nombre de la categoría es requerido.");

        var categoria = new Categoria
        {
            Nombre = dto.Nombre.Trim(),
            Tipo = dto.Tipo,
            UsuarioId = usuarioId,
            Activo = true
        };

        _context.Categorias.Add(categoria);
        await _context.SaveChangesAsync();

        return Ok(categoria);
    }

    // PUT: api/categorias/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> ActualizarCategoria(int id, [FromBody] CrearCategoriaDto dto)
    {
        var usuarioId = ObtenerUsuarioId();

        var categoria = await _context.Categorias
            .FirstOrDefaultAsync(c => c.Id == id && c.UsuarioId == usuarioId);

        if (categoria == null)
            return NotFound("Categoría no encontrada o no tienes permisos para editarla.");

        categoria.Nombre = dto.Nombre.Trim();
        categoria.Tipo = dto.Tipo;

        await _context.SaveChangesAsync();
        return Ok("Categoría actualizada.");
    }

    // PATCH: api/categorias/{id}/estado (Activar / Inactivar)
    [HttpPatch("{id}/estado")]
    public async Task<IActionResult> CambiarEstadoCategoria(int id)
    {
        var usuarioId = ObtenerUsuarioId();

        var categoria = await _context.Categorias
            .FirstOrDefaultAsync(c => c.Id == id && c.UsuarioId == usuarioId);

        if (categoria == null)
            return NotFound("Categoría no encontrada o es del sistema.");

        categoria.Activo = !categoria.Activo; // Alterna estado

        await _context.SaveChangesAsync();
        return Ok(new { mensaje = "Estado actualizado", activo = categoria.Activo });
    }
}