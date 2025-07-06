const express = require('express');
const Book = require('../models/Book');
const User = require('../models/User');
const Borrow = require('../models/Borrow');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get admin dashboard stats
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const [totalBooks, totalUsers, activeBorrows, totalBorrows] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments(),
      Borrow.countDocuments({ status: 'borrowed' }),
      Borrow.countDocuments()
    ]);

    res.json({
      totalBooks,
      totalUsers,
      activeBorrows,
      totalBorrows
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get all users with their borrow stats (admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    // Get all users
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    // Get borrow stats for each user
    const usersWithStats = await Promise.all(users.map(async (user) => {
      // Get all borrows for the user
      const borrows = await Borrow.find({ user: user._id });
      
      // Count active borrows (not returned)
      const activeBorrows = borrows.filter(
        borrow => !borrow.returnDate && !borrow.isReturned
      ).length;
      
      // Get total borrows count
      const totalBorrows = borrows.length;
      
      // Return user with stats
      return {
        ...user.toObject(),
        activeBorrows,
        totalBorrows
      };
    }));
    
    res.json(usersWithStats);
  } catch (error) {
    console.error('Error fetching users with stats:', error);
    res.status(500).json({ 
      message: 'Error fetching users', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Add a new book (admin only)
router.post('/books', adminAuth, async (req, res) => {
  try {
    const book = new Book(req.body);
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update a book (admin only)
router.put('/books/:id', adminAuth, async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a book (admin only)
router.delete('/books/:id', adminAuth, async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all borrow records (admin only)
router.get('/borrows', adminAuth, async (req, res) => {
  try {
    const borrows = await Borrow.find()
      .populate('user', 'name email')
      .populate('book', 'title author')
      .sort({ createdAt: -1 });

    res.json(borrows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get dashboard stats (admin only)
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalBooks = await Book.countDocuments();
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalBorrows = await Borrow.countDocuments();
    const activeBorrows = await Borrow.countDocuments({ status: 'borrowed' });

    res.json({
      totalBooks,
      totalUsers,
      totalBorrows,
      activeBorrows
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;