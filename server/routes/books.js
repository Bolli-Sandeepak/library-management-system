const express = require('express');
const Book = require('../models/Book');
const Borrow = require('../models/Borrow');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all books with pagination and search
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    // Build search query
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } }
      ];
    }

    const [books, total] = await Promise.all([
      Book.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Book.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: books,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ success: false, message: 'Error fetching books' });
  }
});

// Add new book (Admin only)
router.post('/', adminAuth, async (req, res) => {
  console.log('Received request to add book:', req.body);
  try {
    // Map frontend fields to backend fields
    const bookData = {
      title: req.body.title,
      author: req.body.author,
      isbn: req.body.isbn,
      genre: req.body.category || req.body.genre, // Accept both category and genre
      type: req.body.type || 'physical', // Default to 'physical' if not provided
      description: req.body.description || '',
      coverImage: req.body.coverImage || '',
      // Use availableCopies from request or default to 1
      totalCopies: parseInt(req.body.availableCopies || req.body.totalCopies || 1, 10),
      // For now, set publishedYear to current year if not provided
      publishedYear: parseInt(req.body.publishedYear || new Date().getFullYear(), 10)
    };

    // Validate required fields
    const requiredFields = ['title', 'author', 'isbn', 'genre'];
    const missingFields = requiredFields.filter(field => !bookData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        message: 'Missing required fields',
        missingFields,
        receivedData: req.body
      });
    }

    // Check if book with same ISBN already exists
    const existingBook = await Book.findOne({ isbn: bookData.isbn });
    if (existingBook) {
      return res.status(400).json({ message: 'Book with this ISBN already exists' });
    }

    const book = new Book({
      title: bookData.title.trim(),
      author: bookData.author.trim(),
      isbn: bookData.isbn.trim(),
      genre: bookData.genre.trim(),
      type: bookData.type,
      description: bookData.description.trim(),
      publishedYear: bookData.publishedYear,
      totalCopies: bookData.totalCopies,
      availableCopies: bookData.totalCopies, // Set available copies equal to total copies
      coverImage: bookData.coverImage.trim()
    });

    const savedBook = await book.save();
    console.log('Book saved successfully:', savedBook);
    
    res.status(201).json({ 
      message: 'Book added successfully',
      book: savedBook
    });
  } catch (error) {
    console.error('Error adding book:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      body: req.body,
      user: req.user
    });
    res.status(500).json({ 
      message: 'Error adding book',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
});

// Get all books
router.get('/', async (req, res) => {
  try {
    const { search, genre, page = 1, limit = 10 } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    if (genre) {
      query.genre = genre;
    }

    // Convert page and limit to numbers
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;

    // Get total count and paginated results
    const [books, total] = await Promise.all([
      Book.find(query)
        .limit(limitNum)
        .skip((pageNum - 1) * limitNum)
        .sort({ createdAt: -1 })
        .lean(),
      Book.countDocuments(query)
    ]);

    console.log(`Found ${books.length} books (total: ${total})`);

    // Standardize the response format
    const response = {
      success: true,
      data: {
        books: books.map(book => ({
          ...book,
          // Ensure all required fields have defaults
          title: book.title || 'Untitled',
          author: book.author || 'Unknown Author',
          genre: book.genre || book.category || 'Uncategorized',
          type: book.type || 'physical',
          availableCopies: book.availableCopies || 0,
          totalCopies: book.totalCopies || 0,
          coverImage: book.coverImage || ''
        }))
      },
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get book by ID
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update book (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const updates = {
      title: req.body.title,
      author: req.body.author,
      isbn: req.body.isbn,
      genre: req.body.genre || req.body.category,
      type: req.body.type,
      description: req.body.description,
      publishedYear: req.body.publishedYear,
      totalCopies: req.body.totalCopies,
      availableCopies: req.body.availableCopies,
      coverImage: req.body.coverImage
    };

    // Remove undefined fields
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({
      success: true,
      message: 'Book updated successfully',
      book
    });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating book',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Delete book (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    // Check if the book exists first
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Try to check for active borrows if Borrow model is available
    try {
      const Borrow = require('../models/Borrow');
      const activeBorrows = await Borrow.countDocuments({
        book: req.params.id,
        $or: [
          { returnDate: { $exists: false } },
          { isReturned: false }
        ]
      });

      if (activeBorrows > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete book with active borrows'
        });
      }
    } catch (error) {
      console.warn('Could not check for active borrows:', error.message);
      // Continue with deletion even if we can't check borrows
    }

    // Delete the book
    await Book.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Book deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting book',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;