const multer = require("multer");
const pdfParse = require("pdf-parse");

const Pdf = require("../model/pdf.model");
const Chat = require("../model/chat.model");
const {processPdf} = require("../services/pdf/pdf.service");

// store in memory, no disk clutter for personal project
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files allowed"), false);
  }
});

exports.uploadMiddleware = upload.single("pdf");

exports.uploadPdf = async (req, res) => {
  try {
    const { chatId } = req.body;
    const userId = req.user._id; 
    const parsed = await pdfParse(req.file.buffer);
    console.log(chatId)

    // save pdf record
    const pdf = await Pdf.create({
      chatId,
      userId,
      filename: req.file.originalname,
      status: "processing",
      pageCount: parsed.numpages
    });

    // link pdf to chat
    await Chat.findByIdAndUpdate(chatId, { pdfId: pdf._id });

    // trigger chunking + embedding in background
    processPdf(pdf._id, parsed.text).catch(console.error);

    res.status(200).json({ 
      message: "PDF uploaded, processing started",
      pdfId: pdf._id 
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getPdfStatus = async (req, res) => {
  try {
    const pdf = await Pdf.findById(req.params.pdfId)
      .select("filename status pageCount totalChunks createdAt");
    
    if (!pdf) return res.status(404).json({ message: "PDF not found" });

    res.json({ pdf });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};