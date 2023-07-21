# Ejecucion

## Codespace Banco Postgre

Compilar el codigo de mvn con

```bash
mvn clean install
```

Correr las dbs

```bash
docker-compose up
```

Correr la API del banco

```bash
mvn spring-boot:run
```

## Codespace PIG

### Ejecutar el docker compose

```bash
docker-compose up
```

Verificar que esten andando con

```bash
docker-compose ps
```

Correr la API de pig en otra terminal con:

```bash
npm run start
```
