const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const morgan = require('morgan');
require('dotenv').config();
const multer = require('multer'); // Import multer
const path = require('path'); // Import path
const fs = require('fs'); 


const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
   credentials: true
}));

app.use(morgan('dev'));


// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/BusFoodOrder2', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

// User Schema
const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobileNumber: { type: String, required: true },
  password: { type: String, required: true },
  cart: [{
    item: {
      title: { type: String, required: true },
      price: { type: Number, required: true },
      image: { type: String, required: true },
      type: { type: String, required: true },
      status: { type: String, default: 'success' }, 
    },
    quantity: { type: Number, required: true, min: 1 },
    createdAt: { type: Date, default: Date.now },
  }],
  isAdmin: { type: Boolean, default: false }, // Boolean to check if the user is an admin
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt fields
});


const User = mongoose.model('User', UserSchema);

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Authorization Header:', authHeader); // Log the header

  if (token == null) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      console.log('Token verification error:', err); // Log the error
      return res.status(403).json({ message: 'Token is invalid or expired' });
    }

    req.user = user; // Save user info in req object
    next();
  });
};


// Registration Route
// Registration Route
const ADMIN_EMAIL = 'admin1@gmail.com'; // Admin-specific email
const ADMIN_PASSWORD = '123456789'; // Admin-specific password

app.post('/register', [
  body('firstName').notEmpty().withMessage('First name is required.'),
  body('lastName').notEmpty().withMessage('Last name is required.'),
  body('email').isEmail().withMessage('Invalid email.'),
  body('mobileNumber').notEmpty().withMessage('Mobile number is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, email, mobileNumber, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if the user is registering as an admin
    const isAdmin = (email === ADMIN_EMAIL && password === ADMIN_PASSWORD);


    const newUser = new User({
      firstName,
      lastName,
      email,
      mobileNumber,
      password: hashedPassword,
      isAdmin: isAdmin // Set admin status based on your logic
    });

    await newUser.save();

    const payload = { email: newUser.email, userId: newUser._id, isAdmin: newUser.isAdmin };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });

    res.setHeader('Authorization', `Bearer ${accessToken}`);
    res.status(201).json({ message: 'User registered successfully!', user: newUser, accessToken });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed.', error: err.message });
  }
});



// Login Route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      const payload = { email: user.email, userId: user._id, isAdmin: user.isAdmin };
      const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
      return res.json({ msg: 'Login successful!', accessToken, user: { email: user.email, userId: user._id, isAdmin: user.isAdmin } });
    }

    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (err) {
    res.status(500).json({ error: 'An error occurred while logging in user' });
  }
});

app.post('/orders', authenticateToken,async (req, res) => {
  console.log('Headers:', req.headers);
  console.log('Order Data:', req.body);
  console.log('Received File:', req.file);

  try {
    const item = typeof req.body.orderData === 'string' ? JSON.parse(req.body.orderData) : req.body.orderData;
    const quantity = parseInt(req.body.quantity, 10);

    if (!item || !item.title || !item.price || !item.image || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({ message: 'Invalid item data or quantity' });
    }

    const result = await User.findByIdAndUpdate(req.user.userId, {
      $push: {
        cart: {
          item: {
            title: item.title,
            image: item.image,
            price: item.price,
            type: item.type,
          },
          quantity: quantity,
        },
      },
    }, { new: true });

    if (!result) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(201).json({ message: 'Item added to cart successfully!' });
  } catch (error) {
    console.error('Error adding item to cart:', error.message);
    res.status(500).json({ message: 'Error adding item to cart', error: error.message });
  }
});


// Get Cart Items for Logged-in User
app.get('/cart', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user.cart);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cart items', error });
  }
});



// Delete a specific item from the cart
app.delete('/cart/:itemId', authenticateToken, async (req, res) => {
  console.log('User:', req.user); // Log user info
  console.log('Trying to delete item:', req.params.itemId); 
  try {
    const itemId = req.params.itemId;

    // Find the user and remove the item from the cart
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.cart = user.cart.filter(item => item._id.toString() !== itemId);
    await user.save();

    res.status(200).json({ message: 'Item removed from cart successfully' });
  } catch (error) {
    console.error('Error removing item from cart:', error);
    res.status(500).json({ message: 'Error removing item from cart', error: error.message });
  }
});




app.get('/orders', authenticateToken, async (req, res) => {
  try {
    // Check if the logged-in user is an admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Only admins can access all orders.' });
    }

    // Fetch all users and their cart data
    const users = await User.find({}, 'firstName lastName cart'); // Only select relevant fields

    // Extract user details along with their orders
    const allOrders = users.map(user => ({
      userId: user._id,
      name: `${user.firstName} ${user.lastName}`,
      orders: user.cart, // Assuming 'cart' is the collection of orders
    }));

    res.status(200).json(allOrders); // Return the orders of all users
  } catch (error) {
    res.status(500).json({ message: 'Error fetching all orders', error: error.message });
  }
});



// Start the server
const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server started on port ${port}`));
