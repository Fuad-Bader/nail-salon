# Nail Salon Appointment Reservation App

A modern, full-stack nail salon appointment booking application built with Next.js, React, TypeScript, Tailwind CSS, and PostgreSQL.

## Features

- 🔐 **User Authentication**: Secure login and registration with NextAuth.js
- 📅 **Appointment Booking**: Easy-to-use booking system with date and time selection
- 💅 **Service Management**: Browse and filter nail salon services
- 📊 **User Dashboard**: View and manage your appointments
- 🔒 **API Authorization**: Protected API routes with role-based access control
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: React, Next.js 14 (App Router), TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with JWT
- **Password Hashing**: bcryptjs

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- npm or yarn

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   Copy `.env.example` to `.env` and update the values:

   ```bash
   cp .env.example .env
   ```

   Update the following in `.env`:

   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your application URL (http://localhost:3000 for local development)

3. **Set up the database**

   ```bash
   # Generate Prisma Client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev --name init

   # (Optional) Seed the database with sample data
   npm run seed
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

### User

- User authentication and profile information
- Roles: CUSTOMER, ADMIN

### Service

- Nail salon services (manicure, pedicure, etc.)
- Includes pricing, duration, and category

### Appointment

- Booking records linking users to services
- Status: PENDING, CONFIRMED, CANCELLED, COMPLETED

## API Routes

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

### Appointments

- `GET /api/appointments` - Get all appointments (filtered by user)
- `POST /api/appointments` - Create new appointment (authenticated)
- `GET /api/appointments/[id]` - Get appointment details (authenticated)
- `PATCH /api/appointments/[id]` - Update appointment (authenticated, owner/admin)
- `DELETE /api/appointments/[id]` - Delete appointment (authenticated, owner/admin)

### Services

- `GET /api/services` - Get all active services (public)

## Project Structure

```
nail-salon/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── booking/           # Booking page
│   ├── dashboard/         # User dashboard
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── services/          # Services listing
│   └── layout.tsx         # Root layout
├── components/            # Reusable React components
├── lib/                   # Utility functions and configurations
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   └── middleware.ts     # API middleware (auth checks)
├── prisma/               # Database schema and migrations
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run seed         # Seed database with sample data
```

## Prisma Commands

```bash
npx prisma studio              # Open Prisma Studio (database GUI)
npx prisma migrate dev         # Create and apply migrations
npx prisma migrate reset       # Reset database and run all migrations
npx prisma generate            # Generate Prisma Client
```

## Environment Variables

| Variable          | Description                  | Example                                            |
| ----------------- | ---------------------------- | -------------------------------------------------- |
| `DATABASE_URL`    | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/nail_salon` |
| `NEXTAUTH_SECRET` | Secret for JWT signing       | Generate with `openssl rand -base64 32`            |
| `NEXTAUTH_URL`    | Application URL              | `http://localhost:3000`                            |

## Default Credentials (After Seeding)

**Admin Account:**

- Email: admin@nailsalon.com
- Password: admin123

**Customer Account:**

- Email: customer@example.com
- Password: customer123

## Security Features

- Password hashing with bcrypt
- JWT-based session management
- Protected API routes with middleware
- CSRF protection with NextAuth
- Role-based authorization

## Future Enhancements

- Email notifications for appointments
- SMS reminders
- Admin dashboard for managing services
- Staff management and scheduling
- Payment integration
- Review and rating system
- Calendar view for available slots
- Multi-language support

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - feel free to use this project for personal or commercial purposes.
