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

  revalidatePath(`/barbearia/${barbershopId}`); // Adjusting based on Comercio's internal routes
  return review;
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
