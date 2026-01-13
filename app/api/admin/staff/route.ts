import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where = category
      ? { role: "STAFF" as const, specialtyCategory: category }
      : { role: "STAFF" as const };

    const staff = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        specialtyCategory: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            staffAppointments: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("Get staff error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, phone, specialtyCategory } = body;

    if (!name || !email || !password || !specialtyCategory) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const staff = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: "STAFF",
        specialtyCategory,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        specialtyCategory: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(staff, { status: 201 });
  } catch (error) {
    console.error("Create staff error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
