import { z } from 'zod';

export const createMediaSchema = z.object({
  title: z.string().min(1, 'Title is required').max(550, 'Title too long'),
  media_type: z.enum(['anime', 'tv_series']),
  release_date: z.string().nullable().optional(),
  episodes: z.number().int().min(0, 'Episodes must be non-negative').nullable().optional(),
  description: z.string().nullable().optional(),
  score: z.number().min(0.0).max(10.0).nullable().optional(),
  watched_date: z.string().nullable().optional(),
  poster_url: z.string().nullable().optional(),
  backdrop_url: z.string().nullable().optional(),
  studio_id: z.string().uuid('Invalid studio ID').nullable().optional(),
  genre_ids: z.array(z.string().uuid('Invalid genre ID')).optional().default([]),
});

export const updateMediaSchema = createMediaSchema.partial();

export const mediaQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(12),
  search: z.string().optional(),
  type: z.enum(['anime', 'tv_series']).optional(),
  genre: z.string().optional(),
  studio: z.string().optional(),
  releaseYear: z.coerce.number().int().optional(),
  minScore: z.coerce.number().min(0).max(10).optional(),
  maxScore: z.coerce.number().min(0).max(10).optional(),
  watchedFrom: z.string().optional(),
  watchedTo: z.string().optional(),
  sortBy: z.enum(['title', 'release_date', 'score', 'watched_date', 'created_at']).optional().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});
