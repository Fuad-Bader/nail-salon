import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name: newName } = body;
    const oldName = decodeURIComponent(name);

    if (!newName || !newName.trim()) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Check if new category name already exists (and it's not the same category)
    if (newName.trim() !== oldName) {
      const existingCategory = await prisma.category.findUnique({
        where: {
          name: newName.trim(),
        },
      });

      if (existingCategory) {
        return NextResponse.json(
          { error: "Category already exists" },
          { status: 400 }
        );
      }
    }

    // Update the category
    const category = await prisma.category.update({
      where: {
        name: oldName,
      },
      data: {
        name: newName.trim(),
      },
    });

    // Update all services with the old category to use the new category name
    await prisma.service.updateMany({
      where: {
        category: oldName,
      },
      data: {
        category: newName.trim(),
      },
    });

    return NextResponse.json({ name: category.name });
  } catch (error) {
    console.error("Update category error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  try {
    const { name } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const categoryName = decodeURIComponent(name);

    // Check if there are any services using this category
    const serviceCount = await prisma.service.count({
      where: {
        category: categoryName,
      },
    });

    if (serviceCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category. ${serviceCount} service(s) are using this category.`,
        },
        { status: 400 }
      );
    }

    // Delete the category
    await prisma.category.delete({
      where: {
        name: categoryName,
      },
    });

    return NextResponse.json({
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
