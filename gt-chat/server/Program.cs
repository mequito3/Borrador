using Microsoft.EntityFrameworkCore;
using server.Models;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using server.Hubs;
using Microsoft.Extensions.FileProviders; // Nueva directiva añadida
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Net.Http.Headers;
var builder = WebApplication.CreateBuilder(args);

// Cargar variables de entorno (.env) si existiera DotNetEnv (opcional) - se puede añadir paquete si se desea

// Parámetros desde environment / appsettings
var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL") ?? "http://localhost:5173";
var frontendProdUrl = Environment.GetEnvironmentVariable("FRONTEND_PROD_URL");
var uploadPath = Environment.GetEnvironmentVariable("UPLOAD_PATH") ?? "UploadedFiles";

// Add services
builder.Services.AddControllers();
builder.Services.AddSignalR();

// CORS flexible: permite varias origins separadas por coma en FRONTEND_URL
builder.Services.AddCors(options =>
{
    options.AddPolicy("ChatCors", policy =>
    {
        var origins = new List<string> { frontendUrl };
        if (!string.IsNullOrWhiteSpace(frontendProdUrl)) origins.Add(frontendProdUrl);
        origins.Add("http://localhost:5000");

        // En desarrollo aceptar cualquier puerto localhost (útil si Vite cambia 5173 -> 5174)
        policy.SetIsOriginAllowed(origin =>
        {
            if (string.IsNullOrEmpty(origin)) return false;
            if (origin.StartsWith("http://localhost") || origin.StartsWith("https://localhost")) return true;
            return origins.Contains(origin, StringComparer.OrdinalIgnoreCase);
        })
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});


// Configuración de Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "GT Chat API", Version = "v1" });

    // 👇 Esta parte es CLAVE para que Swagger muestre el botón "Authorize"
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme. Ejemplo: 'Bearer {token}'",
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
    {
        new OpenApiSecurityScheme
        {
            Reference = new OpenApiReference
            {
                Type = ReferenceType.SecurityScheme,
                Id = "Bearer"
            }
        },
        Array.Empty<string>()
    }});
});

// Construir connection string dinámicamente si vienen variables de entorno (Railway / Render / etc.)
var dbServer = Environment.GetEnvironmentVariable("DB_SERVER");
var dbPort = Environment.GetEnvironmentVariable("DB_PORT");
var dbName = Environment.GetEnvironmentVariable("DB_NAME");
var dbUser = Environment.GetEnvironmentVariable("DB_USER");
var dbPassword = Environment.GetEnvironmentVariable("DB_PASSWORD");

string? envConn = null;
if (!string.IsNullOrWhiteSpace(dbServer) && !string.IsNullOrWhiteSpace(dbName))
{
    envConn = $"Host={dbServer};Port={dbPort ?? "5432"};Database={dbName};Username={dbUser};Password={dbPassword};SSL Mode=Prefer;Trust Server Certificate=true";
}

var finalConn = envConn ?? builder.Configuration.GetConnectionString("PostgreSQLConnection")!;

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(finalConn));

// confuracion de signalR
builder.Services.AddSignalR();





// Configuración de JWT
var jwtSettings = new JwtSettings();
builder.Configuration.Bind("JwtSettings", jwtSettings);
builder.Services.AddSingleton(jwtSettings);


builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),

        RoleClaimType = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    };
});


var app = builder.Build();

// Configure the HTTP request pipeline.
var enableSwaggerEnv = Environment.GetEnvironmentVariable("ENABLE_SWAGGER");
var enableSwagger = enableSwaggerEnv == null
    ? app.Environment.IsDevelopment() // por defecto solo en dev
    : enableSwaggerEnv.Equals("true", StringComparison.OrdinalIgnoreCase);

if (enableSwagger)
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "GT Chat API v1");
        c.RoutePrefix = "swagger";
    });
}

// Seguridad producción
var httpsRedirect = Environment.GetEnvironmentVariable("ENABLE_HTTPS_REDIRECT");
if (httpsRedirect?.Equals("true", StringComparison.OrdinalIgnoreCase) == true)
{
    app.UseHttpsRedirection();
}
var enableHsts = Environment.GetEnvironmentVariable("ENABLE_HSTS");
if (enableHsts?.Equals("true", StringComparison.OrdinalIgnoreCase) == true && !app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

// CORS
app.UseCors("ChatCors");

app.UseRouting();

app.UseAuthentication();


app.UseAuthorization();

// Asegurar existencia de wwwroot para evitar DirectoryNotFoundException al cargar assets estáticos implícitos
var wwwRootPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
if (!Directory.Exists(wwwRootPath))
{
    Directory.CreateDirectory(wwwRootPath);
}
// Servir archivos de wwwroot (si algún día se suben assets front) con cache bajo
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(wwwRootPath),
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers[HeaderNames.CacheControl] = "public, max-age=3600"; // 1 hora
    }
});

// Archivos estáticos de uploads con caching controlado
var uploadFullPath = Path.Combine(Directory.GetCurrentDirectory(), uploadPath);
Directory.CreateDirectory(uploadFullPath);
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadFullPath),
    RequestPath = "/UploadedFiles",
    OnPrepareResponse = ctx =>
    {
        ctx.Context.Response.Headers[HeaderNames.CacheControl] = "public, max-age=86400"; // 1 día
    }
});




// Configurar SignalR
app.MapHub<server.Hubs.ChatHub>("/hubs/chat");


app.MapControllers();


Console.WriteLine($"Servidor iniciado. Ambiente: {app.Environment.EnvironmentName}");
Console.WriteLine("Swagger: " + (enableSwagger ? "Habilitado" : "Deshabilitado"));

app.Run();

