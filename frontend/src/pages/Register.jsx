import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateName, validateEmail, validatePassword } from '../utils/validation';
import FormValidationError from '../components/FormValidationError';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const { register } = useAuth();
  const navigate = useNavigate();

  // Validate form fields
  const validateForm = () => {
    const errors = {};

    // Validate username
    const usernameResult = validateName(username, 'Username');
    if (!usernameResult.isValid) {
      errors.username = usernameResult.message;
    }

    // Validate email
    const emailResult = validateEmail(email);
    if (!emailResult.isValid) {
      errors.email = emailResult.message;
    }

    // Validate password
    const passwordResult = validatePassword(password);
    if (!passwordResult.isValid) {
      errors.password = passwordResult.message;
    }

    // Validate confirm password
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);

    // Return true if no errors
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset error message
    setError('');

    // Validate form
    if (!validateForm()) {
      setError('Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const result = await register(username, email, password);

      if (result.success) {
        setSuccess('Registration successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
          <h2 className="mt-2 text-xl font-semibold text-gray-700">Register</h2>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-800 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 text-sm text-green-800 bg-green-100 rounded-md">
            {success}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setValidationErrors({...validationErrors, username: ''});
              }}
              className={`block w-full px-3 py-2 mt-1 border ${validationErrors.username ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            <FormValidationError message={validationErrors.username} />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setValidationErrors({...validationErrors, email: ''});
              }}
              className={`block w-full px-3 py-2 mt-1 border ${validationErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            <FormValidationError message={validationErrors.email} />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setValidationErrors({...validationErrors, password: ''});
              }}
              className={`block w-full px-3 py-2 mt-1 border ${validationErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            <FormValidationError message={validationErrors.password} />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setValidationErrors({...validationErrors, confirmPassword: ''});
              }}
              className={`block w-full px-3 py-2 mt-1 border ${validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            <FormValidationError message={validationErrors.confirmPassword} />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>

        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
