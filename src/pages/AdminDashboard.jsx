import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, TrendingUp, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import api from '../config/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    activeBorrows: 0,
    totalBorrows: 0,
  });
  const [recentBooks, setRecentBooks] = useState([]);
  const [recentBorrows, setRecentBorrows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Initialize with default values
      const defaultStats = {
        totalBooks: 0,
        totalUsers: 0,
        activeBorrows: 0,
        totalBorrows: 0,
      };

      // Try to fetch stats if the endpoint exists
      try {
        const statsRes = await api.get('/admin/stats');
        setStats(statsRes.data);
      } catch (error) {
        console.warn('Could not fetch stats:', error.message);
        setStats(defaultStats);
      }

      // Fetch recent books
      try {
        const booksRes = await api.get('/books?limit=5');
        const booksData = booksRes.data?.data || booksRes.data?.books || booksRes.data || [];
        setRecentBooks(Array.isArray(booksData) ? booksData : []);
      } catch (error) {
        console.warn('Could not fetch recent books:', error.message);
        setRecentBooks([]);
      }

      // Try to fetch recent borrows if the endpoint exists
      try {
        const borrowsRes = await api.get('/borrow?limit=5');
        const borrowsData = borrowsRes.data?.data || borrowsRes.data?.borrows || borrowsRes.data || [];
        setRecentBorrows(Array.isArray(borrowsData) ? borrowsData : []);
      } catch (error) {
        console.warn('Could not fetch recent borrows:', error.message);
        setRecentBorrows([]);
      }
    } catch (error) {
      console.error('Error in dashboard data fetching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (bookId) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await api.delete(`/books/${bookId}`);
        fetchDashboardData();
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your library's books and users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Books</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBooks}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Borrows</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeBorrows}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Borrows</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBorrows}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/admin/add-book"
            className="flex items-center space-x-3 p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <Plus className="h-8 w-8 text-indigo-600" />
            <div>
              <p className="font-semibold text-indigo-900">Add New Book</p>
              <p className="text-sm text-indigo-600">Add a new book to the library</p>
            </div>
          </Link>

          <Link
            to="/admin/books"
            className="flex items-center space-x-3 p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            <BookOpen className="h-8 w-8 text-emerald-600" />
            <div>
              <p className="font-semibold text-emerald-900">Manage Books</p>
              <p className="text-sm text-emerald-600">Edit or delete existing books</p>
            </div>
          </Link>

          <Link
            to="/admin/users"
            className="flex items-center space-x-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <Users className="h-8 w-8 text-orange-600" />
            <div>
              <p className="font-semibold text-orange-900">Manage Users</p>
              <p className="text-sm text-orange-600">View and manage user accounts</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Books */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Books</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentBooks.length > 0 ? (
                recentBooks.map((book) => (
                  <div key={book._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{book.title || 'Untitled'}</h3>
                        <p className="text-sm text-gray-600">by {book.author || 'Unknown Author'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link to={`/books/${book._id}`} className="p-2 text-gray-400 hover:text-gray-600">
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link to={`/admin/books/${book._id}/edit`} className="p-2 text-gray-400 hover:text-gray-600">
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteBook(book._id)}
                        className="p-2 text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-4">No books found</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Borrows */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Borrows</h2>
          </div>
          <div className="p-6">
            {recentBorrows.length > 0 ? (
              <div className="space-y-4">
                {recentBorrows.map((borrow) => {
                  const book = borrow.book || borrow.bookId || {};
                  const user = borrow.user || borrow.userId || {};
                  const borrowDate = borrow.borrowDate || borrow.createdAt || new Date();
                  const isReturned = borrow.isReturned || borrow.status === 'returned';
                  
                  return (
                    <div key={borrow._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-semibold text-gray-900">{book.title || 'Unknown Book'}</h3>
                        <p className="text-sm text-gray-600">
                          Borrowed by {user.name || 'Unknown User'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(borrowDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isReturned ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {isReturned ? 'Returned' : 'Borrowed'}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No recent borrows found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
