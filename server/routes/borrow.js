const express = require('express');
const mongoose = require('mongoose');
const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Borrow a book
router.post('/', auth, async (req, res) => {
  try {
    const { bookId } = req.body;

    // Check if book exists and is available
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ message: 'Book not available' });
    }

    // Check if user already borrowed this book
    const existingBorrow = await Borrow.findOne({
      user: req.user._id,
      book: bookId,
      status: 'borrowed'
    });

    if (existingBorrow) {
      return res.status(400).json({ message: 'You have already borrowed this book' });
    }

    // Create borrow record
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14); // 2 weeks from now

    const borrow = new Borrow({
      user: req.user._id,
      book: bookId,
      dueDate
    });

    await borrow.save();

    // Update book availability
    book.availableCopies -= 1;
    await book.save();

    await borrow.populate('book');
    res.status(201).json(borrow);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's borrowed books
router.get('/my-books', auth, async (req, res) => {
  try {
    const borrows = await Borrow.find({ user: req.user._id })
      .populate('book')
      .sort({ createdAt: -1 });

    res.json(borrows);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get recent borrows (for admin dashboard)
router.get('/', auth, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const [borrows, total] = await Promise.all([
      Borrow.find()
        .populate('book', 'title author coverImage')
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip),
      Borrow.countDocuments()
    ]);

    res.json({
      success: true,
      data: borrows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching recent borrows:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch recent borrows',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Return a book
router.put('/:id/return', auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    console.log('Return book request received:', {
      borrowId: req.params.id,
      userId: req.user._id,
      method: req.method,
      url: req.originalUrl
    });

    // Find the borrow record with the session
    const borrow = await Borrow.findOne({
      _id: req.params.id,
      user: req.user._id,
      status: 'borrowed'
    }).session(session);

    console.log('Found borrow record:', borrow);

    if (!borrow) {
      console.log('Borrow record not found or already returned');
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        success: false,
        message: 'Borrow record not found or already returned' 
      });
    }

    // Update borrow record
    borrow.returnDate = new Date();
    borrow.status = 'returned';
    borrow.isReturned = true;
    
    await borrow.save({ session });
    console.log('Borrow record updated:', borrow);

    // Update book availability
    const book = await Book.findById(borrow.book).session(session);
    if (book) {
      book.availableCopies = (book.availableCopies || 0) + 1;
      await book.save({ session });
      console.log('Book availability updated:', book);
    } else {
      console.warn('Book not found for borrow record:', borrow.book);
      throw new Error('Book not found');
    }

    await session.commitTransaction();
    session.endSession();

    await borrow.populate('book');
    res.json({
      success: true,
      message: 'Book returned successfully',
      data: borrow
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error in return book endpoint:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;