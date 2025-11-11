import { NextResponse } from 'next/server';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req) {
  return new Promise((resolve, reject) => {
    upload.single('file')(req, {}, async (err) => {
      if (err) {
        return reject(new NextResponse('Error uploading file', { status: 500 }));
      }

      const file = req.file;

      if (!file) {
        return reject(new NextResponse('No file uploaded', { status: 400 }));
      }

      try {
        const result = await cloudinary.uploader.upload_stream(
          { resource_type: 'auto' },
          (error, result) => {
            if (error) {
              return reject(new NextResponse('Error uploading to Cloudinary', { status: 500 }));
            }
            resolve(new NextResponse(JSON.stringify(result), { status: 200 }));
          }
        );

        file.stream.pipe(result);
      } catch (error) {
        reject(new NextResponse('Error processing upload', { status: 500 }));
      }
    });
  });
}