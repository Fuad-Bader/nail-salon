import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/middleware";
import bcrypt from "bcryptjs";

export async function PATCH(request: NextRequest) {
  return withAuth(request, async (req, token) => {
    try {
      const body = await req.json();
      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword) {
        return NextResponse.json(
          { error: "Current and new password are required" },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters" },
          { status: 400 }
        );
      }

      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: token.id },
        select: { id: true, password: true },
      });

      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 }
        );
      }

      // Hash and update new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: token.id },
        data: { password: hashedPassword },
      });

      return NextResponse.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Update password error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  });
}
