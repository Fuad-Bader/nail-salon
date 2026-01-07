@echo off
echo ========================================
echo Nail Salon App - Quick Setup
echo ========================================
echo.

echo Step 1: Checking if .env file exists...
if not exist .env (
    echo .env file not found! Creating from .env.example...
    copy .env.example .env
    echo.
    echo ⚠️  IMPORTANT: Please edit .env file with your database credentials!
    echo    - Update DATABASE_URL
    echo    - Generate NEXTAUTH_SECRET with: openssl rand -base64 32
    echo.
    pause
) else (
    echo ✓ .env file exists
)

echo.
echo Step 2: Installing dependencies...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✓ Dependencies installed

echo.
echo Step 3: Generating Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo ❌ Failed to generate Prisma Client
    pause
    exit /b 1
)
echo ✓ Prisma Client generated

echo.
echo Step 4: Running database migrations...
call npx prisma migrate dev --name init
if errorlevel 1 (
    echo ❌ Failed to run migrations
    echo    Make sure PostgreSQL is running and DATABASE_URL is correct in .env
    pause
    exit /b 1
)
echo ✓ Database migrations complete

echo.
echo Step 5: Seeding database with sample data...
call npm run seed
if errorlevel 1 (
    echo ❌ Failed to seed database
    pause
    exit /b 1
)
echo ✓ Database seeded

echo.
echo ========================================
echo ✅ Setup Complete!
echo ========================================
echo.
echo You can now start the development server with:
echo   npm run dev
echo.
echo Default login credentials:
echo   Admin: admin@nailsalon.com / admin123
echo   Customer: customer@example.com / customer123
echo.
echo Visit: http://localhost:3000
echo.
pause
