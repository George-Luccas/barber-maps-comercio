import { auth } from "@/app/_lib/auth";
import { db } from "@/app/_lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/**
 * PUT /api/barber-profile
 * 
 * Updates the BARBER_PROMO user profile with:
 * - image: Profile photo URL
 * - name: Display name
 * - phone: Contact phone
 * - bio: About/Description text
 * - specialties: Array of specialties
 * - yearsOfExperience: Years of experience as barber
 * - workplaceName: Barbershop where they work
 * - isAutonomous: Whether they work independently
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      name, 
      phone, 
      image,
      bio, 
      specialties, 
      yearsOfExperience,
      workplaceName, 
      isAutonomous 
    } = body;

    // Build update data - only include provided fields
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (image !== undefined) updateData.image = image;
    if (bio !== undefined) updateData.bio = bio;
    if (specialties !== undefined) updateData.specialties = specialties;
    if (yearsOfExperience !== undefined) updateData.yearsOfExperience = yearsOfExperience;
    if (isAutonomous !== undefined) {
      updateData.isAutonomous = isAutonomous;
      // If autonomous, clear workplace name
      if (isAutonomous) {
        updateData.workplaceName = null;
      }
    }
    if (workplaceName !== undefined && !isAutonomous) {
      updateData.workplaceName = workplaceName;
    }

    // Update user profile
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        bio: true,
        specialties: true,
        yearsOfExperience: true,
        isAutonomous: true,
        workplaceName: true,
        role: true,
      }
    });

    return NextResponse.json({ 
      success: true, 
      user: {
        ...updatedUser,
        accountType: updatedUser.role,
        isPromoBarber: updatedUser.role === "BARBER_PROMO",
      }
    });
  } catch (error) {
    console.error("Error updating barber profile:", error);
    return NextResponse.json({ error: "Erro ao atualizar perfil" }, { status: 500 });
  }
}

/**
 * GET /api/barber-profile
 * 
 * Returns the current user's profile data including all barber-specific fields.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        image: true,
        bio: true,
        specialties: true,
        yearsOfExperience: true,
        isAutonomous: true,
        workplaceName: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        ...user,
        createdAt: user.createdAt.toISOString(),
        accountType: user.role,
        isPromoBarber: user.role === "BARBER_PROMO",
      }
    });
  } catch (error) {
    console.error("Error fetching barber profile:", error);
    return NextResponse.json({ error: "Erro ao buscar perfil" }, { status: 500 });
  }
}
