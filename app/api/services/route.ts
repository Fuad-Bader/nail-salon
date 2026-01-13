import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const session = await getServerSession(authOptions);

    // For admin, show all services. For others, only active services
    const where =
      session?.user?.role === "ADMIN"
        ? category
          ? { category }
          : {}
        : category
        ? { category, isActive: true }
        : { isActive: true };

    const services = await prisma.service.findMany({
      where,
      orderBy: {
        category: "asc",
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Get services error:", error);
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
    const { name, description, duration, price, category, isActive } = body;

    if (!name || !duration || !price || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const service = await prisma.service.create({
      data: {
        name,
        description,
        duration,
        price,
        category,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error("Create service error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
