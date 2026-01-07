# Setup Instructions

## Quick Start Guide

Follow these steps to get your nail salon app running:

### 1. Database Setup

Make sure you have PostgreSQL installed and running. Create a database:

```sql
CREATE DATABASE nail_salon;
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your actual values:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/nail_salon?schema=public"
NEXTAUTH_SECRET="your-generated-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

**Generate NEXTAUTH_SECRET:**

```bash
openssl rand -base64 32
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Database Migration

```bash
# Generate Prisma Client
npx prisma generate

# Create database tables
npx prisma migrate dev --name init
```

### 5. Seed Database (Optional)

Populate the database with sample services and test users:

```bash
npm run seed
```

This creates:

- Admin account: `admin@nailsalon.com` / `admin123`
- Customer account: `customer@example.com` / `customer123`
- 12 nail services across different categories
- 1 sample appointment

### 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Testing the Application

1. **Register a new account** at `/register`
2. **Login** at `/login`
3. **Browse services** at `/services`
4. **Book an appointment** at `/booking`
5. **View your appointments** at `/dashboard`

## Database Management

### View Database with Prisma Studio

```bash
npx prisma studio
```

This opens a web interface at `http://localhost:5555` to view and edit your database.

### Reset Database

```bash
npx prisma migrate reset
```

This will:

- Drop the database
- Create a new database
- Run all migrations
- Run seed script (if configured)

## Troubleshooting

### Database Connection Issues

If you get a database connection error:

1. Verify PostgreSQL is running
2. Check your `DATABASE_URL` in `.env`
3. Ensure the database exists
4. Check username/password are correct

### Prisma Client Issues

If you get "Cannot find module '@prisma/client'":

```bash
npx prisma generate
```

### NextAuth Session Issues

If authentication isn't working:

1. Verify `NEXTAUTH_SECRET` is set in `.env`
2. Verify `NEXTAUTH_URL` matches your local URL
3. Clear browser cookies and try again

### Port Already in Use

If port 3000 is already in use:

```bash
npm run dev -- -p 3001
```

## Production Deployment

### 1. Build the application

```bash
npm run build
```

### 2. Set production environment variables

Update `.env` for production:

- Use production database URL
- Generate new `NEXTAUTH_SECRET`
- Set `NEXTAUTH_URL` to production domain

### 3. Run migrations on production database

```bash
npx prisma migrate deploy
```

### 4. Start production server

```bash
npm start
```

## Key Features to Test

- ✅ User registration and login
- ✅ View services by category
- ✅ Book appointments with date/time selection
- ✅ View appointment history in dashboard
- ✅ Cancel pending/confirmed appointments
- ✅ Admin vs customer role differences
- ✅ API authentication and authorization
- ✅ Responsive design on mobile/tablet

## Next Steps

1. Customize services in the database
2. Add your salon's branding (colors, logo)
3. Configure email notifications
4. Set up payment processing
5. Add admin dashboard features
6. Deploy to production

Enjoy your new nail salon booking system! 💅
