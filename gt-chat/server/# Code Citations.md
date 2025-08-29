# Code Citations

## License: unknown
https://github.com/ElizangelaFLeal/APIRest/tree/9d05b3e2d5510be8366834ba32cccc3630608558/curso.api/Startup.cs

```
,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement {
        {
            new OpenApiSecurityScheme {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    }
```


## License: unknown
https://github.com/PhilTitan/HotelListing/tree/e8e180d5ebddd39cea6d0559d90038a3275e47cb/HotelListingNew/ServiceExtensions.cs

```
.AddAuthentication(o =>
{
    o.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    o.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(o =>
{
    o.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
```

