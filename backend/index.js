const express = require('express');
require('dotenv').config();
const app = express();
const authRoutes = require('./src/routes/auth.routes');
const aiRoutes = require('./src/routes/ai.routes');
const chatRoutes = require('./src/routes/saveChat.route')
const cors = require('cors');

const connectDB = require('./src/config/db');
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());
connectDB();

app.use('/auth', authRoutes);
app.use('/ai', aiRoutes);
app.use('/ai/', chatRoutes);

app.use('/', (req, res) => {
    res.send(`server running on ${3000}`)
})


app.listen(3000, () => {
    console.log('Server is running on port 3000');
})