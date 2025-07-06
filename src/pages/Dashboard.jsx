import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, User, Clock, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import api from '../config/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBorrowedBooks();
  }, []);

  const fetchBorrowedBooks = async () => {
    try {
      const response = await api.get('/borrow/my-books');
      // Map the response to ensure consistent data structure
      const formattedBorrows = response.data.map(borrow => ({
        ...borrow,
        // Use book data from either book or bookId field
        bookId: borrow.book || borrow.bookId || {}
      }));
      setBorrowedBooks(formattedBorrows);
    } catch (error) {
      console.error('Error fetching borrowed books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (borrowId) => {
    try {
      console.log('Attempting to return book with borrowId:', borrowId);
      const response = await api.put(`/borrow/${borrowId}/return`);
      console.log('Return book response:', response.data);
      
      if (response.data.success) {
        // Refresh the borrowed books list
        fetchBorrowedBooks();
      } else {
        console.error('Failed to return book:', response.data.message);
        alert(`Failed to return book: ${response.data.message || 'Unknown error'}`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error('Error returning book:', {
        message: errorMessage,
        response: error.response?.data,
        status: error.response?.status,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      alert(`Error returning book: ${errorMessage}`);
    }
  };

  const activeBorrows = borrowedBooks.filter(borrow => !borrow.isReturned);
  const pastBorrows = borrowedBooks.filter(borrow => borrow.isReturned);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user.name}!</h1>
            <p className="text-indigo-100">
              You have {activeBorrows.length} active book{activeBorrows.length !== 1 ? 's' : ''} borrowed
            </p>
          </div>
          <div className="hidden md:block">
            <User className="h-16 w-16 text-indigo-200" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Borrows</p>
              <p className="text-2xl font-bold text-gray-900">{activeBorrows.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Books Returned</p>
              <p className="text-2xl font-bold text-gray-900">{pastBorrows.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available Slots</p>
              <p className="text-2xl font-bold text-gray-900">{3 - activeBorrows.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Currently Borrowed Books */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Currently Borrowed Books</h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : activeBorrows.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No books currently borrowed</p>
              <Link
                to="/books"
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Browse Books
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {activeBorrows.map((borrow) => (
                <div key={borrow._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{borrow.bookId?.title || 'Unknown Book'}</h3>
                      <p className="text-sm text-gray-600">by {borrow.bookId?.author || 'Unknown Author'}</p>
                      <p className="text-xs text-gray-500">
                        Borrowed: {borrow.borrowDate ? format(new Date(borrow.borrowDate), 'MMM dd, yyyy') : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {borrow.bookId?.type === 'digital' && borrow.bookId?.pdfUrl && (
                      <a
                        href={borrow.bookId.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Read Online</span>
                      </a>
                    )}
                    <button
                      onClick={() => handleReturn(borrow._id)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Return Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reading History */}
      {pastBorrows.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Reading History</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {pastBorrows.slice(0, 5).map((borrow) => (
                <div key={borrow._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-16 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{borrow.bookId.title}</h3>
                      <p className="text-sm text-gray-600">by {borrow.bookId.author}</p>
                      <p className="text-xs text-gray-500">
                        Returned: {format(new Date(borrow.returnDate), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    Returned
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;