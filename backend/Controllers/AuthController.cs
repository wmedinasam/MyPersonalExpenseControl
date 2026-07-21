using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("registro")]
    public async Task<IActionResult> Registro([FromBody] RegistroDto dto)
    {
        if (await _context.Usuarios.AnyAsync(u => u.Email == dto.Email.ToLower()))
        {
            return BadRequest("El correo electrónico ya está registrado.");
        }

        // Encriptar la contraseña con BCrypt
        string passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        var usuario = new Usuario
        {
            Nombre = dto.Nombre,
            Email = dto.Email.ToLower(),
            PasswordHash = passwordHash
        };

        _context.Usuarios.Add(usuario);

        // Crear categorías iniciales por defecto para el nuevo usuario
        var categoriasDefecto = new List<Categoria>
        {
            new Categoria { Usuario = usuario, Nombre = "Alimentación", Tipo = TipoMovimiento.Gasto },
            new Categoria { Usuario = usuario, Nombre = "Transporte", Tipo = TipoMovimiento.Gasto },
            new Categoria { Usuario = usuario, Nombre = "Servicios (Luz, Agua, Internet)", Tipo = TipoMovimiento.Gasto },
            new Categoria { Usuario = usuario, Nombre = "Salario", Tipo = TipoMovimiento.Ingreso },
            new Categoria { Usuario = usuario, Nombre = "Otros Ingresos", Tipo = TipoMovimiento.Ingreso }
        };

        _context.Categorias.AddRange(categoriasDefecto);
        await _context.SaveChangesAsync();

        var token = GenerarJwtToken(usuario);

        return Ok(new RespuestaAuthDto
        {
            Token = token,
            Nombre = usuario.Nombre,
            Email = usuario.Email
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());

        if (usuario == null || !BCrypt.Net.BCrypt.Verify(dto.Password, usuario.PasswordHash))
        {
            return Unauthorized("Credenciales inválidas.");
        }

        var token = GenerarJwtToken(usuario);

        return Ok(new RespuestaAuthDto
        {
            Token = token,
            Nombre = usuario.Nombre,
            Email = usuario.Email
        });
    }

    private string GenerarJwtToken(Usuario usuario)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new Claim(ClaimTypes.Name, usuario.Nombre),
            new Claim(ClaimTypes.Email, usuario.Email)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Secret"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7), // Token válido por 7 días
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}