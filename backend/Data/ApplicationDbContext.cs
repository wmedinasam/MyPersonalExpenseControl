using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Usuario> Usuarios => Set<Usuario>();
    public DbSet<Cuenta> Cuentas => Set<Cuenta>();
    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Transaccion> Transacciones => Set<Transaccion>();
    public DbSet<Presupuesto> Presupuestos => Set<Presupuesto>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Precisiones decimales para Quetzales
        modelBuilder.Entity<Cuenta>().Property(c => c.SaldoInicial).HasPrecision(18, 2);
        modelBuilder.Entity<Cuenta>().Property(c => c.SaldoActual).HasPrecision(18, 2);
        modelBuilder.Entity<Transaccion>().Property(t => t.Monto).HasPrecision(18, 2);
        modelBuilder.Entity<Presupuesto>().Property(p => p.MontoLimite).HasPrecision(18, 2);

        // Deshabilitar borrados en cascada para evitar ciclos/caminos múltiples en SQL Server

        // Transacciones
        modelBuilder.Entity<Transaccion>()
            .HasOne(t => t.Cuenta)
            .WithMany(c => c.Transacciones)
            .HasForeignKey(t => t.CuentaId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Transaccion>()
            .HasOne(t => t.Categoria)
            .WithMany(c => c.Transacciones)
            .HasForeignKey(t => t.CategoriaId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Transaccion>()
            .HasOne(t => t.Usuario)
            .WithMany(u => u.Transacciones)
            .HasForeignKey(t => t.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict);

        // Presupuestos
        modelBuilder.Entity<Presupuesto>()
            .HasOne(p => p.Categoria)
            .WithMany(c => c.Presupuestos)
            .HasForeignKey(p => p.CategoriaId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Presupuesto>()
            .HasOne(p => p.Usuario)
            .WithMany(u => u.Presupuestos)
            .HasForeignKey(p => p.UsuarioId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}