const multer = require('multer');
const supabase = require('./supabase.config');

// Store file in memory buffer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

async function uploadToSupabase(file) {
    try {
        const bucket = process.env.SUPABASE_STORAGE_BUCKET;

        if (!bucket) {
            console.error("❌ Supabase bucket name is missing in .env");
            return null;
        }

        const filePath = `uploads/${Date.now()}_${file.originalname}`;
        
        // ✅ Upload file to Supabase storage
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file.buffer, {
                cacheControl: '3600',
                upsert: false, 
                contentType: file.mimetype // Ensure correct file type
            });

        if (error) throw error;

        // ✅ Get the public URL of the uploaded file
        const { publicURL } = supabase.storage.from(bucket).getPublicUrl(filePath);

        console.log('✅ File uploaded successfully:', publicURL);
        
        return { filePath, publicURL };
    } catch (err) {
        console.error('❌ Upload error:', err.message);
        return null;
    }
}

module.exports = { upload, uploadToSupabase };
