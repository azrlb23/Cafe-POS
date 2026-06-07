import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma.js';

/**
 * Log an activity performed by a user.
 * BUG-019: Uses singleton Prisma client instead of creating a new instance.
 */
export async function log(
  userId: number,
  action: string,
  description: string,
  tx: Prisma.TransactionClient | null = null
) {
  const client = tx || prisma;
  return client.activityLog.create({
    data: {
      userId,
      action,
      description,
    },
  });
}
