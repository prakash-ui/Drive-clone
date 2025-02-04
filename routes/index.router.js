const express = require('express');
const { upload, uploadToSupabase } = require('../config/multer.config');
const authMiddleware = require('../middlewares/auth');


const router = express.Router();


router.get('/home',authMiddleware,(req,res) => {
    res.render('homepage')
});

router.post('/upload-file',authMiddleware, upload.single('file'), async (req, res) => {
    console.log(req.file);
    
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await uploadToSupabase(req.file);
    
    if (!result) {
        return res.status(500).json({ error: 'Upload failed' });
    }

    res.json({
        message: 'File uploaded successfully',
        filePath: result.filePath,
        fileURL: result.publicURL
    });
});


module.exports = router;