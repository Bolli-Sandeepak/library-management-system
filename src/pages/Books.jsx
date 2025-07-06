import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Plus, BookOpen, Download, Bookmark, HardDrive, Globe } from 'lucide-react';
import api from '../config/api';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      console.log('Fetching books from:', '/books');
      const response = await api.get('/books');
      console.log('Books API response data:', response.data);
      
      // Handle the standardized response structure
      let booksData = [];
      
      if (response.data?.data?.books && Array.isArray(response.data.data.books)) {
        // New standardized structure
        booksData = response.data.data.books;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        // Fallback to data array
        booksData = response.data.data;
      } else if (response.data?.books && Array.isArray(response.data.books)) {
        // Old structure with books array
        booksData = response.data.books;
      } else if (Array.isArray(response.data)) {
        // Direct array response
        booksData = response.data;
      }
      
      console.log('Extracted books data:', booksData);
      
      if (booksData && booksData.length > 0) {
        console.log(`Setting ${booksData.length} books`);
        setBooks(booksData);
      } else {
        console.warn('No books found in response');
        setBooks([]);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredBooks = Array.isArray(books) ? books.filter(book => {
    const bookCategory = book.category || book.genre; // Handle both category and genre
    const matchesSearch = book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book?.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || bookCategory?.toLowerCase() === categoryFilter.toLowerCase();
    const matchesType = !typeFilter || book?.type === typeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  }) : [];

  // Extract unique categories/genres from books
  const categories = [...new Set(books.map(book => book.category || book.genre).filter(Boolean))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Discover Your Next Great Read</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore our vast collection of books across all genres and formats
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search books by title or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">All Types</option>
              <option value="physical">Physical</option>
              <option value="digital">Digital</option>
            </select>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredBooks.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No books found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map((book) => (
            <Link
              key={book._id}
              to={`/book/${book._id}`}
              className="group bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="aspect-w-3 aspect-h-4 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <BookOpen className="h-16 w-16 text-white" />
              </div>
              
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    {book.category || book.genre || 'Uncategorized'}
                  </span>
                  <div className="flex items-center">
                    {book.type === 'digital' ? (
                      <Globe className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <HardDrive className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                  {book.title}
                </h3>
                <p className="text-sm text-gray-600 mb-3">by {book.author}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {book.availableCopies || book.totalCopies || 0} {book.availableCopies === 1 ? 'copy' : 'copies'} available
                  </span>
                  <span className={`text-sm font-medium ${
                    (book.availableCopies || book.totalCopies || 0) > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {(book.availableCopies || book.totalCopies || 0) > 0 ? 'Available' : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Books;