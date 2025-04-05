const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());
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
  orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }], // Store order IDs here
});

const User = mongoose.model('User', UserSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    title: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    type: { type: String, required: true },
    quantity: { type: Number, default: 1 }, // moved to each item
  }],
});


const Order = mongoose.model('Order', orderSchema);

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('Received token:', token); // Log token for debugging

  if (!token) {
    return res.status(401).json({ message: 'Token not provided' });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    req.user = user;
    next();
  });
};

// Registration Route
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
    const newUser = new User({
      firstName,
      lastName,
      email,
      mobileNumber,
      password: hashedPassword,
    });

    await newUser.save();

    const payload = { email: newUser.email, userId: newUser._id };
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });

    console.log('New user registered, token generated:', accessToken);
    res.setHeader('Authorization', `Bearer ${accessToken}`);
    res.status(201).json({ message: 'User registered successfully!', user: newUser, accessToken });
  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ message: 'Registration failed.', error: err.message });
  }
});

// Login Route
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(password, user.password)) {
      const payload = { email: user.email, userId: user._id };
      const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });
      console.log('User logged in, token generated:', accessToken);
      return res.json({ msg: 'Login successful!', accessToken, user: { email: user.email, userId: user._id } });
    }

    return res.status(401).json({ message: 'Invalid email or password' });
  } catch (err) {
    console.error('Error while logging in user:', err);
    res.status(500).json({ error: 'An error occurred while logging in user' });
  }
});

// Place Order Route
app.post('/orders', authenticateToken, async (req, res) => {
  const { items } = req.body; // change to items

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'Items data is invalid or missing' });
  }

  // Validate each item in the items array
  for (const item of items) {
    if (!item.title || !item.price || !item.image || !item.type) {
      return res.status(400).json({ message: 'Invalid item data' });
    }
  }

  try {
    const newOrder = new Order({
      items, // Save all items together
      userId: req.user.userId,
    });

    await newOrder.save();
    await User.findByIdAndUpdate(req.user.userId, {
      $push: { orders: newOrder._id },
    });

    res.status(201).json({ message: 'Order placed successfully!', order: newOrder });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Error placing order', error });
  }
});

// Get Orders for Logged-in User
app.get('/orders', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate('orders');
    res.status(200).json(user.orders); // Return the populated orders
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
});

// Start the server
const port = process.env.PORT || 8000;
app.listen(port, () => console.log(`Server started on port ${port}`));
