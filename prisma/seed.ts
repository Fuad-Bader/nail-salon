import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Starting database seed...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@nailsalon.com" },
    update: {},
    create: {
      email: "admin@nailsalon.com",
      password: adminPassword,
      name: "Admin User",
      phone: "+1 (555) 000-0000",
      role: "ADMIN",
    },
  });
  console.log("Created admin user:", admin.email);

  // Create sample customer
  const customerPassword = await bcrypt.hash("customer123", 10);
  const customer = await prisma.user.upsert({
    where: { email: "customer@example.com" },
    update: {},
    create: {
      email: "customer@example.com",
      password: customerPassword,
      name: "Jane Doe",
      phone: "+1 (555) 123-4567",
      role: "CUSTOMER",
    },
  });
  console.log("Created customer user:", customer.email);

  // Create categories first
  const categories = [
    "Manicure",
    "Pedicure",
    "Artificial Nails",
    "Nail Art",
    "Repair",
  ];

  for (const categoryName of categories) {
    const category = await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: { name: categoryName },
    });
    console.log("Created category:", category.name);
  }

  // Create services
  const services = [
    {
      name: "Classic Manicure",
      description: "Traditional nail care with polish",
      duration: 30,
      price: 25,
      category: "Manicure",
    },
    {
      name: "Gel Manicure",
      description: "Long-lasting gel polish application",
      duration: 45,
      price: 40,
      category: "Manicure",
    },
    {
      name: "French Manicure",
      description: "Classic French tips",
      duration: 40,
      price: 35,
      category: "Manicure",
    },
    {
      name: "Classic Pedicure",
      description: "Foot care with polish",
      duration: 45,
      price: 35,
      category: "Pedicure",
    },
    {
      name: "Spa Pedicure",
      description: "Luxurious pedicure with massage",
      duration: 60,
      price: 50,
      category: "Pedicure",
    },
    {
      name: "Gel Pedicure",
      description: "Long-lasting gel polish for toes",
      duration: 50,
      price: 45,
      category: "Pedicure",
    },
    {
      name: "Acrylic Full Set",
      description: "Complete acrylic nail application",
      duration: 90,
      price: 65,
      category: "Artificial Nails",
    },
    {
      name: "Acrylic Fill",
      description: "Maintenance for acrylic nails",
      duration: 60,
      price: 45,
      category: "Artificial Nails",
    },
    {
      name: "Dip Powder",
      description: "Durable powder manicure",
      duration: 60,
      price: 50,
      category: "Artificial Nails",
    },
    {
      name: "Nail Art Design",
      description: "Custom nail art per nail",
      duration: 15,
      price: 5,
      category: "Nail Art",
    },
    {
      name: "Nail Art Full Set",
      description: "Detailed designs on all nails",
      duration: 30,
      price: 20,
      category: "Nail Art",
    },
    {
      name: "Nail Repair",
      description: "Fix broken or damaged nails",
      duration: 15,
      price: 10,
      category: "Repair",
    },
  ];

  for (const service of services) {
    const created = await prisma.service.upsert({
      where: { id: service.name.toLowerCase().replace(/\s+/g, "-") },
      update: {},
      create: service,
    });
    console.log("Created service:", created.name);
  }

  // Create a sample appointment
  const firstService = await prisma.service.findFirst();
  if (firstService) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const appointment = await prisma.appointment.create({
      data: {
        userId: customer.id,
        serviceId: firstService.id,
        date: tomorrow,
        startTime: "10:00",
        endTime: "10:30",
        status: "CONFIRMED",
        notes: "Looking forward to my appointment!",
      },
    });
    console.log("Created sample appointment:", appointment.id);
  }

  console.log("Database seed completed!");
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
