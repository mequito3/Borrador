# Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
# Copiamos solo el .csproj primero para cache eficiente
COPY server/server.csproj server/
RUN dotnet restore server/server.csproj
# Copiamos el resto del código
COPY server/ server/
WORKDIR /src/server
RUN dotnet publish server.csproj -c Release -o /app/publish

# Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://0.0.0.0:${PORT}
ENTRYPOINT ["dotnet","server.dll"]