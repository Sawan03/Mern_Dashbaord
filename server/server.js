// Import required modules
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { body, validationResult } = require('express-validator');
const cors = require('cors'); // Import cors
const path = require('path');

// Create the Express app
const app = express();

// Middleware
app.use(express.json());
app.use(helmet()); // Adds security headers
app.use(morgan('combined')); // Logs HTTP requests

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend origin
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
}));

// Enable trust proxy
app.set('trust proxy', 1); // Set to 1 to trust the first proxy

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use(limiter);

// Connect to MongoDB Atlas (replace with your URI)
const MONGO_URI = 'mongodb+srv://sawanrathore815:DkpGTG6W7r31lt8y@cluster1.sctq7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));

// User schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['Administrator', 'Manager', 'Regular User'],
    default: 'Regular User',
  },
});
// Job schema and model
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: Number, required: true },

});



const Job = mongoose.model('Job', jobSchema);


const User = mongoose.model('User', userSchema);





// Middleware to verify JWT and extract user info
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret'); // Replace with your secret key
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

// Middleware to check role permissions
const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: 'Access forbidden: insufficient rights' });
    }
    next();
  };
};

// Middleware to validate job creation data
const validateJobData = [
  body('title').isString().notEmpty().withMessage('Title is required'),
  body('description').isString().notEmpty().withMessage('Description is required'),
  body('location').isString().notEmpty().withMessage('Location is required'),
  body('salary').isNumeric().withMessage('Salary must be a number'),
];

// Route to create a job
app.post('/api/create-job', authenticateToken, validateJobData, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, location, salary } = req.body;

  try {
    const newJob = new Job({ title, description, location, salary });
    await newJob.save();
    res.status(201).json({ message: 'Job created successfully' });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route to get all job openings
app.get('/api/job-openings', async (req, res) => {
  try {
    const jobs = await Job.find();
    res.json({ jobs }); // Wrap in an object with 'jobs' key to match frontend expectation
  } catch (error) {
    console.error('Error fetching job openings:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register route
app.post(
    '/api/register',
    [
      body('username').isString().notEmpty().withMessage('Username is required'),
      body('password').isString().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { username, password } = req.body;
      console.log('Received registration data:', { username, password });
  
      try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
          console.log('Username already exists:', username);
          return res.status(400).json({ message: 'Username already exists' });
        }
  
        let role;
        if (username.toLowerCase().includes('admin')) {
          role = 'Administrator';
        } else if (username.toLowerCase().includes('manager')) {
          role = 'Manager';
        } else {
          role = 'Regular User';
        }
  
        const hashedPassword = await bcrypt.hash(password, 10);
  
        const newUser = new User({ username, password: hashedPassword, role });
        await newUser.save();
  
        console.log('User registered successfully:', username);
        res.status(201).json({ message: 'User registered successfully' });
      } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error' });
      }
    }
  );
  

// Login route
app.post(
  '/api/login',
  [
    body('username').isString().notEmpty().withMessage('Username is required'),
    body('password').isString().notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(400).json({ message: 'User not found' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      // Generate JWT token with role and username
      const token = jwt.sign(
        { id: user._id, role: user.role, username: user.username },
        'your_jwt_secret', // Replace with your secret key
        { expiresIn: '1h' }
      );

      res.json({ token, role: user.role, username: user.username });
    } catch (error) {
      console.error('Error logging in:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// Route to get data for Administrators
app.get('/api/admin-data', authenticateToken, authorizeRole(['Administrator']), (req, res) => {
  res.json({ message: 'Admin specific data' });
});

// Route to get data for Managers
app.get('/api/manager-data', authenticateToken, authorizeRole(['Manager']), (req, res) => {
  res.json({ message: 'Manager specific data' });
});









// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));