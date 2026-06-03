const express = require('express');
require('dotenv').config();
const app = express();
const authRoutes = require('./src/routes/auth.routes');
const aiRoutes = require('./src/routes/ai.routes');
const chatRoutes = require('./src/routes/saveChat.route');
const pdfRoutes = require('./src/routes/pdf.routes');  // ← add this
const cors = require('cors');

const connectDB = require('./src/config/db');
app.use(
  cors({
    origin: [process.env.FRONTEND_URL ,'http://localhost:5173'],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());
connectDB();

app.use('/auth', authRoutes);
app.use('/ai', aiRoutes);
app.use('/ai/history', chatRoutes);
app.use('/ai/pdf', pdfRoutes);     

app.use('/', (req, res) => {
    res.send(`server running on ${process.env.PORT || 3000}`)
})
app.use("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});
app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
})