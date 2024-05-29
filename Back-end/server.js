// Import required modules
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
require('dotenv').config();

// Create an instance of Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Load environment variables from .env file
require('dotenv').config();



// Routers
const auditRouter = require("./routes/auditRouter.js");
const glbRouter = require("./routes/glbRouter.js");
const emsRouter = require("./routes/emsRouter.js");
const commonRouter = require("./routes/commonRouter.js");
const uploadRouter = require('./routes/uploadRouter.js');

// Use routers
app.use("/api/audit", auditRouter);
app.use("/api/glb", glbRouter);
app.use("/api/ems", emsRouter);
app.use("/api/common", commonRouter);
app.use('/api/upload', uploadRouter);

// Port
const PORT = process.env.PORT || 8080;
// Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
