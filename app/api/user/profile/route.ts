import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware";

export async function PATCH(request: NextRequest) {
  return withAuth(request, async (req, token) => {
    try {
      const body = await req.json();
      const { name, email, phone } = body;

      if (!name || !email || !phone) {
        return NextResponse.json(
          { error: "All fields are required" },
          { status: 400 }
        );
      }

      // Check if email is already taken by another user
      if (email !== token.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          return NextResponse.json(
            { error: "Email is already in use" },
            { status: 400 }
          );
        }
      }

      const user = await prisma.user.update({
        where: { id: token.id },
        data: { name, email, phone },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
        },
      });

      return NextResponse.json(user);
    } catch (error) {
      console.error("Update profile error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
