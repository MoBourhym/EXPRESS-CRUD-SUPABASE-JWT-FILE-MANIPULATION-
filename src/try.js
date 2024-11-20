// Import required modules


// Import required modules
import express from 'express';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient('https://errfdqreqafrjahghyhg.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVycmZkcXJlcWFmcmphaGdoeWhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA1NjkzNzEsImV4cCI6MjA0NjE0NTM3MX0.PcXP__6MYVvQlkobiEaEZg2Fb3SHv3xD0d5bZ6nwiwg');

// Set up Multer for file upload handling (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Define an endpoint to handle file uploads
app.post('/upload', upload.single('cin'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Extract file details
    const { originalname, buffer, mimetype } = req.file;
    
    // Ensure only allowed file types
    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(mimetype)) {
      return res.status(400).json({ error: 'Only .jpg and .png files are allowed' });
    }

    // Generate a unique file name for storage
    const fileName = `public/${Date.now()}-${originalname}`;

    // Upload the file to the specified bucket and path
    const { data, error } = await supabase.storage
      .from('cin')  // Replace with your bucket name
      .upload(fileName, buffer, {
        contentType: mimetype,
        cacheControl: '3600',  // Optional: set cache control
        upsert: false,         // Optional: prevent overwriting files with the same name
      });

    if (error) throw error;

    // Generate a public URL for the uploaded file
    const { data: publicUrlData } = supabase.storage
      .from('cin')
      .getPublicUrl(fileName);

    // Check if the URL was generated successfully
    if (!publicUrlData.publicUrl) {
      return res.status(500).json({ error: 'Could not generate a public URL' });
    }

    // Respond with the public   URL of the uploaded file
    res.status(200).json({ url: publicUrlData.publicUrl });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
