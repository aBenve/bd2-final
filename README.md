# Ejecucion

## Codespace Banco Verde

En el directorio `banco_mongo`

Configurar el archivo `.env` en base al template `.env.dev`:

```.env
PORT= # Puerto en el que se correrá la api
DATABASE_URL= # URL completa de la base de datos (p.e.: mongodb://localhost:27017/Banco_Verde)
```

Ejecutar el docker compose con la bd y la api:

```bash
docker-compose up --build
```

## Codespace Banco Azul

En el directorio `banco_postgres`

Compilar el codigo:

```bash
mvn clean install
```

Correr la db:

```bash
docker-compose -f compose.yaml up
```

Correr la API del banco:

```bash
mvn spring-boot:run
```

## Codespace PIG

En el directorio `pig_next`

Configurar el archivo `.env` en base al template `.env.dev`:

```.env
POSTGRES_HOST=localhost
POSTGRES_PORT=5431
POSTGRES_USER=pig
POSTGRES_PASSWORD=123
POSTGRES_DATABASE=users

RABBITMQ_HOST=amqp://localhost
RABBITMQ_PORT=5672

MONGO_BANK_API= # url del puerto forwardeado en el codespace del Banco Verde (incluír /api al final)
POSTGRE_BANK_API= # url del puerto forwardeado en el codespace del Banco Azul

NODE_ENV=dev

NEXT_PUBLIC_API_URL= # url del puerto 3000 de este codespace
```

Ejecutar el docker compose:

```bash
docker-compose up
```

Verificar que esten andando con:

```bash
docker-compose ps
```

Buildear y correr la API y el frontend:

```bash
npm run build && npm run start
```
