import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, BookOpen, Book, FileText, Hash, Type, Calendar, Image as ImageIcon } from 'lucide-react';
import api from '../config/api';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditBook = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [book, setBook] = useState({
    title: '',
    author: '',
    isbn: '',
    genre: '',
    type: 'physical',
    description: '',
    publishedYear: new Date().getFullYear(),
    totalCopies: 1,
    coverImage: ''
  });

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await api.get(`/books/${id}`);
        setBook({
          title: response.data.title,
          author: response.data.author,
          isbn: response.data.isbn,
          genre: response.data.genre,
          type: response.data.type || 'physical',
          description: response.data.description || '',
          publishedYear: response.data.publishedYear || new Date().getFullYear(),
          totalCopies: response.data.totalCopies || 1,
          availableCopies: response.data.availableCopies || response.data.totalCopies || 1,
          coverImage: response.data.coverImage || ''
        });
      } catch (error) {
        console.error('Error fetching book:', error);
        toast.error(error.response?.data?.message || 'Failed to load book details');
        navigate('/admin/books');
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBook(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await api.put(`/books/${id}`, book);
      if (response.data.success) {
        toast.success('Book updated successfully');
        navigate('/admin/books');
      } else {
        throw new Error(response.data.message || 'Failed to update book');
      }
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        'Failed to update book. Please try again.'
      );
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Books
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Edit Book</h1>
        <p className="text-gray-600">Update the book details below</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                <BookOpen className="h-4 w-4 inline-block mr-1 text-indigo-600" />
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={book.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="author" className="block text-sm font-medium text-gray-700">
                <Book className="h-4 w-4 inline-block mr-1 text-indigo-600" />
                Author *
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={book.author}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="isbn" className="block text-sm font-medium text-gray-700">
                <Hash className="h-4 w-4 inline-block mr-1 text-indigo-600" />
                ISBN *
              </label>
              <input
                type="text"
                id="isbn"
                name="isbn"
                value={book.isbn}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="genre" className="block text-sm font-medium text-gray-700">
                <Type className="h-4 w-4 inline-block mr-1 text-indigo-600" />
                Genre/Category *
              </label>
              <input
                type="text"
                id="genre"
                name="genre"
                value={book.genre}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                <BookOpen className="h-4 w-4 inline-block mr-1 text-indigo-600" />
                Book Type *
              </label>
              <select
                id="type"
                name="type"
                value={book.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="physical">Physical Book</option>
                <option value="digital">E-book/Digital</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="publishedYear" className="block text-sm font-medium text-gray-700">
                <Calendar className="h-4 w-4 inline-block mr-1 text-indigo-600" />
                Published Year
              </label>
              <input
                type="number"
                id="publishedYear"
                name="publishedYear"
                min="1000"
                max={new Date().getFullYear() + 1}
                value={book.publishedYear}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="totalCopies" className="block text-sm font-medium text-gray-700">
                <Hash className="h-4 w-4 inline-block mr-1 text-indigo-600" />
                Total Copies *
              </label>
              <input
                type="number"
                id="totalCopies"
                name="totalCopies"
                min="1"
                value={book.totalCopies}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="availableCopies" className="block text-sm font-medium text-gray-700">
                <Hash className="h-4 w-4 inline-block mr-1 text-indigo-600" />
                Available Copies *
              </label>
              <input
                type="number"
                id="availableCopies"
                name="availableCopies"
                min="0"
                max={book.totalCopies}
                value={book.availableCopies}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700">
                <ImageIcon className="h-4 w-4 inline-block mr-1 text-indigo-600" />
                Cover Image URL
              </label>
              <input
                type="url"
                id="coverImage"
                name="coverImage"
                value={book.coverImage}
                onChange={handleChange}
                placeholder="https://example.com/book-cover.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                <FileText className="h-4 w-4 inline-block mr-1 text-indigo-600" />
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows="4"
                value={book.description}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              ></textarea>
            </div>
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/books')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
              disabled={saving}
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBook;
