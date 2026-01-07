# Docker Setup Guide

This guide explains how to use Docker Compose to run PostgreSQL for the nail salon app.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

### 1. Start the Database

```bash
docker-compose up -d
```

This will start:

- **PostgreSQL** on port 5432
- **pgAdmin** (optional) on port 5050

### 2. Verify Services are Running

```bash
docker-compose ps
```

You should see both services running.

### 3. Update Environment Variables

The `.env.example` file is already configured for Docker. If you haven't created `.env` yet:

```bash
cp .env.example .env
```

The database URL should be:

```env
DATABASE_URL="postgresql://nailsalon:nailsalon123@localhost:5432/nail_salon?schema=public"
```

### 4. Run Database Migrations

```bash
npx prisma migrate dev --name init
```

### 5. Seed the Database

```bash
npm run seed
```

## Docker Compose Services

### PostgreSQL Database

- **Image**: postgres:16-alpine
- **Port**: 5432
- **Database**: nail_salon
- **Username**: nailsalon
- **Password**: nailsalon123
- **Data Volume**: postgres_data (persisted)

### pgAdmin (Database Management UI)

Access pgAdmin at [http://localhost:5050](http://localhost:5050)

**Default Credentials:**

- Email: admin@nailsalon.com
- Password: admin123

**To connect to PostgreSQL from pgAdmin:**

1. Right-click "Servers" → "Register" → "Server"
2. General tab: Name = "Nail Salon DB"
3. Connection tab:
   - Host: postgres (or host.docker.internal on Windows/Mac)
   - Port: 5432
   - Database: nail_salon
   - Username: nailsalon
   - Password: nailsalon123
4. Click "Save"

## Common Docker Commands

### Start Services

```bash
docker-compose up -d
```

### Stop Services

```bash
docker-compose down
```

### Stop and Remove Data (⚠️ This deletes all database data)

```bash
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs

# PostgreSQL only
docker-compose logs postgres

# Follow logs in real-time
docker-compose logs -f
```

### Restart Services

```bash
docker-compose restart
```

### Check Service Status

```bash
docker-compose ps
```

## Database Connection from Host

Your Next.js application running on your host machine can connect to PostgreSQL using:

```
postgresql://nailsalon:nailsalon123@localhost:5432/nail_salon
```

## Database Backup and Restore

### Backup Database

```bash
docker exec nail-salon-db pg_dump -U nailsalon nail_salon > backup.sql
```

### Restore Database

```bash
docker exec -i nail-salon-db psql -U nailsalon nail_salon < backup.sql
```

## Customizing Database Credentials

To use different credentials, edit `docker-compose.yml`:

```yaml
environment:
  POSTGRES_USER: your_username
  POSTGRES_PASSWORD: your_secure_password
  POSTGRES_DB: your_database_name
```

Then update your `.env` file's `DATABASE_URL` accordingly.

## Troubleshooting

### Port Already in Use

If port 5432 is already in use, change the port mapping in `docker-compose.yml`:

```yaml
ports:
  - "5433:5432" # Use port 5433 on host
```

Then update your `DATABASE_URL`:

```env
DATABASE_URL="postgresql://nailsalon:nailsalon123@localhost:5433/nail_salon?schema=public"
```

### Container Won't Start

Check logs:

```bash
docker-compose logs postgres
```

### Reset Everything

To completely reset the database:

```bash
docker-compose down -v
docker-compose up -d
npx prisma migrate dev --name init
npm run seed
```

### Can't Connect from Application

1. Ensure Docker containers are running: `docker-compose ps`
2. Check DATABASE_URL in `.env` matches Docker credentials
3. Verify firewall isn't blocking port 5432
4. Try using `127.0.0.1` instead of `localhost` in DATABASE_URL

## Production Considerations

For production deployment:

1. **Use strong passwords** - Change default credentials in `docker-compose.yml`
2. **Enable SSL** - Configure PostgreSQL SSL certificates
3. **Backup strategy** - Set up automated backups
4. **Monitoring** - Add health checks and monitoring
5. **Resource limits** - Add memory and CPU limits to services
6. **Environment variables** - Use Docker secrets or env files instead of hardcoding credentials

Example with resource limits:

```yaml
services:
  postgres:
    # ... other config
    deploy:
      resources:
        limits:
          cpus: "1"
          memory: 1G
        reservations:
          cpus: "0.5"
          memory: 512M
```

## Alternative: Running Without pgAdmin

If you don't need pgAdmin, you can remove it from `docker-compose.yml` or stop just that service:

```bash
docker-compose stop pgadmin
```

## Data Persistence

Database data is stored in Docker volumes:

- `postgres_data` - PostgreSQL data
- `pgadmin_data` - pgAdmin settings

These persist even when containers are stopped. To view volumes:

```bash
docker volume ls
```

To remove volumes (⚠️ deletes data):

```bash
docker-compose down -v
```
