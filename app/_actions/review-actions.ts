"use server";

import { db } from "@/app/_lib/prisma";
import { revalidatePath } from "next/cache";

interface CreateReviewParams {
  barbershopId: string;
  userId: string;
  rating: number;
  comment?: string;
}

export const createBarbershopReview = async (params: CreateReviewParams) => {
  const { barbershopId, userId, rating, comment } = params;

  // Ensure user exists (shadow user logic like in API)
  let user = await db.user.findUnique({ where: { id: userId } });
  
  if (!user) {
     // We don't have userName here in type, but we can assume "Visitante" or require it?
     // Since this is internal action, maybe simpler to specific "Visitante"
     // Or we update CreateReviewParams to include userName optionally?
     // Let's create a placeholder.
     user = await db.user.create({
        data: {
            id: userId,
            name: `Visitante ${userId.slice(0,4)}`,
            email: `${userId}@created-by-action.com`,
            role: "CLIENT"
        }
     });
  }

  const review = await db.review.upsert({
    where: {
      userId_barbershopId: {
        userId,
        barbershopId,
      },
    },
    update: {
      rating,
      comment,
    },
    create: {
      userId,
      barbershopId,
      rating,
      comment,
    },
  });

  try {
    revalidatePath(`/barbearia/${barbershopId}`);
    revalidatePath(`/`);
  } catch (error) {
    console.warn("Revalidation failed:", error);
  }

  // Return a clear success object or serializable data
  return JSON.parse(JSON.stringify(review));
};

export const getBarbershopReviews = async (barbershopId: string) => {
  return await db.review.findMany({
    where: { barbershopId },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getBarbershopRating = async (barbershopId: string) => {
  const reviews = await db.review.findMany({
    where: { barbershopId },
    select: { rating: true },
  });

  if (reviews.length === 0) return { average: 0, count: 0 };

  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  const average = sum / reviews.length;

  return {
    average: parseFloat(average.toFixed(1)),
    count: reviews.length,
  };
};
