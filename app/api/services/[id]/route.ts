import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        description,
        duration,
        price,
        category,
        isActive,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("Update service error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if there are any appointments using this service
    const appointmentCount = await prisma.appointment.count({
      where: {
        serviceId: id,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    if (appointmentCount > 0) {
      return NextResponse.json(
        {
          error:
            "Cannot delete service with active appointments. Please complete or cancel them first.",
        },
        { status: 400 }
      );
    }

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Delete service error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
