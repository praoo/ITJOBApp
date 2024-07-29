const express = require("express");
const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
require("dotenv").config();
const cors = require('cors');
const path = require('path');
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/error");

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const jobTypeRoute = require('./routes/jobsTypeRoutes');
const jobRoute = require('./routes/jobsRoutes');

// Database connection
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("DB connection successful");
}).catch((err) => {
  console.error("DB connection error: ", err);
});

// Middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ limit: "5mb", extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:3000"],
  credentials: true
}));

app.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  next();
});

// Routes middleware
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', jobTypeRoute);
app.use('/api', jobRoute);

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send('API is running....');
  });
}

// Error middleware
app.use(errorHandler);

// Port
const port = process.env.PORT || 9000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
