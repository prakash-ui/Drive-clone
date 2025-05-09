import { useEffect, useState, useRef } from 'react';

export default function Home() {
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const modalRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    // Check if the user is authenticated
    const checkAuth = async () => {
      try {
        const res = await fetch(`${API_URL}/api/users/check-auth`, {
          method: 'GET',
          credentials: 'include',
        });

        if (!res.ok) {
          window.location.href = '/login';
        }
      } catch (err) {
        console.error('Auth check error:', err);
        window.location.href = '/login';
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    // Close modal on outside click or Escape key
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowPopup(false);
        setSelectedFile(null);
        setMessage('');
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowPopup(false);
        setSelectedFile(null);
        setMessage('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'];
      if (!validTypes.includes(file.type)) {
        setMessage('Please upload a PNG, JPG, GIF, or SVG file.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setMessage('File size must be less than 5MB.');
        return;
      }
      setSelectedFile(file);
      setMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setMessage('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await fetch(`${API_URL}/api/files/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('File uploaded successfully!');
        setSelectedFile(null);
        setTimeout(() => setShowPopup(false), 2000);
      } else {
        setMessage(data.error || 'Failed to upload file.');
      }
    } catch (err) {
      setMessage('Server error. Please check if the backend is running.');
    }
  };

  if (loading) return <div className="text-center p-8 text-lg">Loading...</div>;

  return (
    <main className="min-h-screen w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-4">
      {/* Upload Button */}
      <button
        onClick={() => setShowPopup(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow-md transition duration-200"
      >
        Upload File
      </button>

      {/* Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white dark:bg-gray-700 rounded-lg shadow-lg w-full max-w-md p-6">
            <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
              {/* Dropzone */}
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-400 rounded-lg bg-gray-50 dark:bg-gray-600 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-500 transition"
              >
                <div className="text-center">
                  {selectedFile ? (
                    <p className="text-sm text-gray-600 dark:text-gray-200 font-medium">
                      Selected: {selectedFile.name}
                    </p>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 dark:text-gray-200 font-medium">
                        Click to upload or drag & drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                        PNG, JPG, GIF, SVG (Max: 5MB)
                      </p>
                    </>
                  )}
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  name="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept="image/png,image/jpeg,image/gif,image/svg+xml"
                />
              </label>

              {/* Message */}
              {message && (
                <div
                  className={`text-sm text-center p-3 rounded-md ${
                    message.includes('success')
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}
                >
                  {message}
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPopup(false);
                    setSelectedFile(null);
                    setMessage('');
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}