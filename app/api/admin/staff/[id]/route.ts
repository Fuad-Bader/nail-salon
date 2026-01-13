import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
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
    const { name, phone, specialtyCategory, isActive } = body;

    const staff = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(phone !== undefined && { phone }),
        ...(specialtyCategory !== undefined && { specialtyCategory }),
        ...(isActive !== undefined && { isActive }),
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

    return NextResponse.json(staff);
  } catch (error) {
    console.error("Update staff error:", error);
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

    // Check for active appointments
    const activeAppointments = await prisma.appointment.count({
      where: {
        staffId: id,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    if (activeAppointments > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete staff member with ${activeAppointments} active appointment(s)`,
        },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Staff member deleted successfully" });
  } catch (error) {
    console.error("Delete staff error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
