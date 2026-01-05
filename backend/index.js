require('dotenv').config();
const express = require('express');
const cors = require("cors");
const connectDB = require('./config/database');

// Connect to MongoDB
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth.routes'));
app.use('/claims', require('./routes/claims.routes'));

app.listen(process.env.PORT, () => {
    console.log(`API running on port ${process.env.PORT}`);
});
