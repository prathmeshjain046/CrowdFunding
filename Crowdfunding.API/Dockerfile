FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS="https://*:8080"


USER root

RUN apt-get update && \
    apt-get install -y --no-install-recommends libicu-dev locales && \
    echo "en_US.UTF-8 UTF-8" > /etc/locale.gen && \
    locale-gen en_US.UTF-8 && \
    dpkg-reconfigure --frontend noninteractive locales && \
    rm -rf /var/lib/apt/lists/*


ENV DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=0
ENV LC_ALL=en_US.UTF-8
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US.UTF-8


RUN useradd -m appuser && chown -R appuser /app
USER appuser


FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Crowdfunding.API/Crowdfunding.API.csproj", "Crowdfunding.API/"]
RUN dotnet restore "./Crowdfunding.API/Crowdfunding.API.csproj"
COPY . .  
WORKDIR "/src/Crowdfunding.API"
RUN dotnet build "./Crowdfunding.API.csproj" -c $BUILD_CONFIGURATION -o /app/build


FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Crowdfunding.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false


FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .


ENTRYPOINT ["/bin/sh", "-c", "export DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=0 && dotnet Crowdfunding.API.dll"]