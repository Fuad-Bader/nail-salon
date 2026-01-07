import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, withAdminAuth } from "@/lib/middleware";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, token) => {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: params.id },
        include: {
          service: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      if (!appointment) {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(appointment);
    } catch (error) {
      console.error("Get appointment error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, token) => {
    try {
      const body = await req.json();
      const { status, date, startTime, endTime, notes } = body;

      const appointment = await prisma.appointment.findUnique({
        where: { id: params.id },
      });

      if (!appointment) {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404 }
        );
      }

      // Only admin or the appointment owner can update
      if (token.role !== "ADMIN" && appointment.userId !== token.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const updatedAppointment = await prisma.appointment.update({
        where: { id: params.id },
        data: {
          ...(status && { status }),
          ...(date && { date: new Date(date) }),
          ...(startTime && { startTime }),
          ...(endTime && { endTime }),
          ...(notes !== undefined && { notes }),
        },
        include: {
          service: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      });

      return NextResponse.json(updatedAppointment);
    } catch (error) {
      console.error("Update appointment error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, token) => {
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: params.id },
      });

      if (!appointment) {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404 }
        );
      }

      // Only admin or the appointment owner can delete
      if (token.role !== "ADMIN" && appointment.userId !== token.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      await prisma.appointment.delete({
        where: { id: params.id },
      });

      return NextResponse.json({ message: "Appointment deleted" });
    } catch (error) {
      console.error("Delete appointment error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
