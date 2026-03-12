FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

COPY ["backend/src/Api/Api.csproj", "src/Api/"]
COPY ["backend/src/Domain/Domain.csproj", "src/Domain/"]
COPY ["backend/src/Infrastructure/Infrastructure.csproj", "src/Infrastructure/"]
COPY ["backend/src/Application/Application.csproj", "src/Application/"]

RUN dotnet restore "src/Api/Api.csproj"

COPY . .

WORKDIR "/src/backend/src/Api"
RUN dotnet build "Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Api.dll"]