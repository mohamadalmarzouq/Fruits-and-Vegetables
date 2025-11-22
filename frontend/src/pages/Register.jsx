import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const Register = () => {
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role');
  const [registerType, setRegisterType] = useState(roleFromUrl === 'vendor' ? 'vendor' : 'buyer'); // 'vendor' or 'buyer'
  
  useEffect(() => {
    if (roleFromUrl === 'vendor') {
      setRegisterType('vendor');
    } else if (roleFromUrl === 'buyer') {
      setRegisterType('buyer');
    }
  }, [roleFromUrl]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [buyerType, setBuyerType] = useState('individual'); // For buyer registration
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      if (registerType === 'vendor') {
        const result = await register(email, password);
        if (result.success) {
          setSuccess(result.message || 'Registration successful! Waiting for admin approval.');
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          setError(result.error);
        }
      } else {
        // Buyer registration
        const response = await api.post('/auth/register/buyer', {
          email,
          password,
          buyerType
        });
        setSuccess('Buyer registration successful!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-block mb-4">
            <h1 className="text-3xl font-bold text-green-600">FreshSavor</h1>
          </Link>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join FreshSavor to get started
          </p>
        </div>

        {/* Registration Form Card */}
        <div className="bg-white shadow-xl rounded-xl p-8 border border-gray-100">
          {/* Registration Type Selector */}
          <div className="flex space-x-2 justify-center mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setRegisterType('vendor')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition ${
                registerType === 'vendor'
                  ? 'bg-green-600 text-white shadow'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              As Vendor
            </button>
            <button
              type="button"
              onClick={() => setRegisterType('buyer')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-semibold transition ${
                registerType === 'buyer'
                  ? 'bg-green-600 text-white shadow'
                  : 'text-gray-700 hover:text-gray-900'
              }`}
            >
              As Buyer
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg">
                {success}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {registerType === 'buyer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type
                  </label>
                  <div className="flex space-x-4 bg-gray-50 p-2 rounded-lg">
                    <label className="flex-1 flex items-center justify-center p-3 rounded-lg cursor-pointer transition hover:bg-gray-100">
                      <input
                        type="radio"
                        name="buyerType"
                        value="individual"
                        checked={buyerType === 'individual'}
                        onChange={(e) => setBuyerType(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Individual</span>
                    </label>
                    <label className="flex-1 flex items-center justify-center p-3 rounded-lg cursor-pointer transition hover:bg-gray-100">
                      <input
                        type="radio"
                        name="buyerType"
                        value="organization"
                        checked={buyerType === 'organization'}
                        onChange={(e) => setBuyerType(e.target.value)}
                        className="mr-2"
                      />
                      <span className="text-sm font-medium text-gray-700">Organization</span>
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm transition"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition shadow-lg hover:shadow-xl"
              >
                {loading ? 'Registering...' : `Register as ${registerType === 'vendor' ? 'Vendor' : 'Buyer'}`}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-medium text-green-600 hover:text-green-500"
                >
                  Login here
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            to="/"
            className="text-sm text-gray-600 hover:text-green-600"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

