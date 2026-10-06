import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Resolve target uploads directory in frontend/public/uploads
 */
const getUploadDir = (): string => {
  const possiblePaths = [
    path.resolve(process.cwd(), '..', 'frontend', 'public', 'uploads'),
    path.resolve(process.cwd(), 'frontend', 'public', 'uploads'),
    path.resolve(process.cwd(), 'public', 'uploads'),
    path.resolve(process.cwd(), 'uploads'),
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(path.dirname(p))) {
      if (!fs.existsSync(p)) {
        try {
          fs.mkdirSync(p, { recursive: true });
        } catch {
          continue;
        }
      }
      return p;
    }
  }

  // Fallback
  const fallback = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(fallback)) {
    fs.mkdirSync(fallback, { recursive: true });
  }
  return fallback;
};

export const uploadFile = async (req: Request, res: Response) => {
  try {
    const { file, fileName } = req.body;

    if (!file) {
      return res.status(400).json({ success: false, message: 'No file data provided.' });
    }

    let base64Data = file;
    let extension = 'png';

    // Handle data:mime/type;base64, format
    const matches = file.match(/^data:([A-Za-z0-9-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const mimeType = matches[1];
      base64Data = matches[2];
      if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = 'jpg';
      else if (mimeType.includes('png')) extension = 'png';
      else if (mimeType.includes('webp')) extension = 'webp';
      else if (mimeType.includes('pdf')) extension = 'pdf';
    } else if (fileName && fileName.includes('.')) {
      extension = fileName.split('.').pop() || 'png';
    }

    const uploadDir = getUploadDir();
    const cleanName = (fileName || 'doc')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 30);
    const uniqueFileName = `${Date.now()}-${uuidv4().slice(0, 8)}-${cleanName}.${extension}`;
    const filePath = path.join(uploadDir, uniqueFileName);

    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      url: publicUrl,
      fileName: uniqueFileName,
      sizeBytes: buffer.length,
    });
  } catch (error: any) {
    console.error('[Upload Error]', error);
    return res.status(500).json({ success: false, message: error.message || 'Failed to upload file.' });
  }
};
