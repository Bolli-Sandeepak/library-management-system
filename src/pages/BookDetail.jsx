import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Calendar, Globe, HardDrive, ArrowLeft, ExternalLink } from 'lucide-react';
import axios from 'axios';

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBook();
  }, [id]);

  const fetchBook = async () => {
    try {
      const response = await axios.get(`/api/books/${id}`);
      setBook(response.data);
    } catch (error) {
      console.error('Error fetching book:', error);
      setError('Book not found');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setBorrowing(true);
    try {
      await axios.post('/api/borrow', { bookId: id });
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to borrow book');
    } finally {
      setBorrowing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate('/books')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Books
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/books')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span>Back to Books</span>
      </button>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="md:flex">
          {/* Book Cover */}
          <div className="md:w-1/3 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center p-8">
            <BookOpen className="h-32 w-32 text-white" />
          </div>

          {/* Book Details */}
          <div className="md:w-2/3 p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                {book.category}
              </span>
              <div className="flex items-center space-x-2">
                {book.type === 'digital' ? (
                  <Globe className="h-5 w-5 text-emerald-500" />
                ) : (
                  <HardDrive className="h-5 w-5 text-blue-500" />
                )}
                <span className="text-sm text-gray-600 capitalize">{book.type}</span>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-2">{book.title}</h1>
            <p className="text-xl text-gray-600 mb-4">by {book.author}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">ISBN</p>
                <p className="font-medium">{book.isbn}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Available Copies</p>
                <p className="font-medium">{book.availableCopies}</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Description</p>
              <p className="text-gray-700 leading-relaxed">{book.description}</p>
            </div>

            <div className="flex items-center space-x-4">
              {book.availableCopies > 0 ? (
                <button
                  onClick={handleBorrow}
                  disabled={borrowing || !user}
                  className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {borrowing ? 'Borrowing...' : 'Borrow Book'}
                </button>
              ) : (
                <div className="px-6 py-3 bg-gray-100 text-gray-500 font-semibold rounded-lg">
                  Currently Unavailable
                </div>
              )}

              {book.type === 'digital' && book.pdfUrl && user && (
                <a
                  href={book.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <ExternalLink className="h-5 w-5" />
                  <span>Read Online</span>
                </a>
              )}
            </div>

            {!user && (
              <p className="text-sm text-gray-500 mt-4">
                Please <button 
                  onClick={() => navigate('/login')}
                  className="text-indigo-600 hover:text-indigo-700 underline"
                >
                  sign in
                </button> to borrow this book.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;