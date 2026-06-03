const router = require("express").Router();
const { uploadMiddleware, uploadPdf,getPdfStatus } = require("../controllers/pdf.controller");
const { protect } = require('../middleware/auth.middleware');


router.post("/upload", protect, uploadMiddleware, uploadPdf);
router.get("/status/:pdfId", protect, getPdfStatus);  

module.exports = router;