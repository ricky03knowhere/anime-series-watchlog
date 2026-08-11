import { z } from 'zod';

export const createGenreSchema = z.object({
  name: z.string().min(1, 'Genre name is required').max(100, 'Genre name too long'),
  description: z.string().nullable().optional(),
});

export const updateGenreSchema = createGenreSchema.partial();

export const genreQuerySchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(['name', 'created_at']).optional().default('name'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
});
