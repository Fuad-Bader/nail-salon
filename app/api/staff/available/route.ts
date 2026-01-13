import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const date = searchParams.get("date");
    const startTime = searchParams.get("startTime");
    const endTime = searchParams.get("endTime");

    if (!category || !date || !startTime || !endTime) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const appointmentDate = new Date(date);

    // Get all staff members for this category
    const allStaff = await prisma.user.findMany({
      where: {
        role: "STAFF",
        specialtyCategory: category,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        staffAppointments: {
          where: {
            date: appointmentDate,
            status: {
              notIn: ["CANCELLED", "COMPLETED"],
            },
          },
          select: {
            startTime: true,
            endTime: true,
          },
        },
      },
    });

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

    // Filter out staff with conflicting appointments
    const availableStaff = allStaff.filter((staff) => {
      return !staff.staffAppointments.some((appointment) =>
        hasTimeOverlap(
          startTime,
          endTime,
          appointment.startTime,
          appointment.endTime
        )
      );
    });

    return NextResponse.json(
      availableStaff.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
      }))
    );
  } catch (error) {
    console.error("Get available staff error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
