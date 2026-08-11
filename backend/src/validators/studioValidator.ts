import { z } from 'zod';

export const createStudioSchema = z.object({
  name: z.string().min(1, 'Studio name is required').max(255, 'Studio name too long'),
  description: z.string().nullable().optional(),
  website_url: z.string().url('Invalid website URL').nullable().optional().or(z.literal('')),
});

export const updateStudioSchema = createStudioSchema.partial();

export const studioQuerySchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(['name', 'created_at']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});
