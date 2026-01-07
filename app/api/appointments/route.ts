import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware";

export async function GET(request: NextRequest) {
  return withAuth(request, async (req, token) => {
    try {
      const { searchParams } = new URL(req.url);
      const userId = searchParams.get("userId");

      const where = userId ? { userId } : {};

      const appointments = await prisma.appointment.findMany({
        where,
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
        orderBy: {
          date: "desc",
        },
      });

      return NextResponse.json(appointments);
    } catch (error) {
      console.error("Get appointments error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, token) => {
    try {
      const body = await req.json();
      const { serviceId, date, startTime, endTime, notes } = body;

      if (!serviceId || !date || !startTime || !endTime) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Check if time slot is available
      const existingAppointment = await prisma.appointment.findFirst({
        where: {
          date: new Date(date),
          startTime,
          status: {
            not: "CANCELLED",
          },
        },
      });

      if (existingAppointment) {
        return NextResponse.json(
          { error: "Time slot not available" },
          { status: 400 }
        );
      }

      const appointment = await prisma.appointment.create({
        data: {
          userId: token.id as string,
          serviceId,
          date: new Date(date),
          startTime,
          endTime,
          notes,
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

      return NextResponse.json(appointment, { status: 201 });
    } catch (error) {
      console.error("Create appointment error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
