import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import path from 'path';
import fs from 'fs';

export const uploadController = {
  async uploadImage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No image file uploaded' });
        return;
      }

      const file = req.file;
      const bucketType = (req.body.bucket as string) || 'media-posters';
      const bucketName = bucketType === 'media-backdrops' ? 'media-backdrops' : 'media-posters';

      // Allowed types check
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        res.status(400).json({
          success: false,
          message: 'Invalid file type. Only JPG, JPEG, PNG, and WEBP images are allowed.',
        });
        return;
      }

      // Max size check: 1MB (per spec requirement)
      if (file.size > 1024 * 1024) {
        res.status(400).json({
          success: false,
          message: 'File size exceeds maximum limit of 1MB.',
        });
        return;
      }

      const fileExt = path.extname(file.originalname).toLowerCase() || '.jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${fileExt}`;

      let publicUrl = '';

      // Try uploading to Supabase Storage first
      try {
        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: true,
          });

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(fileName);
          publicUrl = urlData.publicUrl;
        }
      } catch (err) {
        console.warn('[Upload] Supabase Storage upload failed, using local/data URL fallback');
      }

      // Fallback: create base64 data URL if Supabase storage isn't accessible
      if (!publicUrl) {
        const base64 = file.buffer.toString('base64');
        publicUrl = `data:${file.mimetype};base64,${base64}`;
      }

      res.status(201).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: publicUrl,
          fileName,
          bucket: bucketName,
        },
      });
    } catch (error) {
      next(error);
    }
  },
};
