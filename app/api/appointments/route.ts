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
      const { serviceId, date, startTime, endTime, notes, staffId } = body;

      if (!serviceId || !date || !startTime || !endTime) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }

      const appointmentDate = new Date(date);

      // Helper function to check time overlap
      const hasTimeOverlap = (
        start1: string,
        end1: string,
        start2: string,
        end2: string
      ) => {
        const [h1, m1] = start1.split(":").map(Number);
        const [h2, m2] = end1.split(":").map(Number);
        const [h3, m3] = start2.split(":").map(Number);
        const [h4, m4] = end2.split(":").map(Number);

        const start1Mins = h1 * 60 + m1;
        const end1Mins = h2 * 60 + m2;
        const start2Mins = h3 * 60 + m3;
        const end2Mins = h4 * 60 + m4;

        return start1Mins < end2Mins && end1Mins > start2Mins;
      };

      // Check for customer overlap
      const customerOverlap = await prisma.appointment.findFirst({
        where: {
          userId: token.id as string,
          date: appointmentDate,
          status: {
            notIn: ["CANCELLED", "COMPLETED"],
          },
        },
      });

      if (
        customerOverlap &&
        hasTimeOverlap(
          startTime,
          endTime,
          customerOverlap.startTime,
          customerOverlap.endTime
        )
      ) {
        return NextResponse.json(
          { error: "You already have an appointment at this time" },
          { status: 400 }
        );
      }

      // Check for staff overlap if staff is assigned
      if (staffId) {
        const staffOverlap = await prisma.appointment.findFirst({
          where: {
            staffId,
            date: appointmentDate,
            status: {
              notIn: ["CANCELLED", "COMPLETED"],
            },
          },
        });

        if (
          staffOverlap &&
          hasTimeOverlap(
            startTime,
            endTime,
            staffOverlap.startTime,
            staffOverlap.endTime
          )
        ) {
          return NextResponse.json(
            { error: "Selected staff member is not available at this time" },
            { status: 400 }
          );
        }
      }

      const appointment = await prisma.appointment.create({
        data: {
          userId: token.id as string,
          serviceId,
          staffId: staffId || null,
          date: appointmentDate,
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
          staff: staffId
            ? {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              }
            : undefined,
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
