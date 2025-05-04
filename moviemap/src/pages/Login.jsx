import React, { useState } from 'react';
import { login } from '../utils/firebase';
import { useAuth } from '../utils/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      // Success - auth context will update
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="login-page">
        <h2>Already Logged In</h2>
        <p>You are logged in as {user.email}</p>
        <p>User ID: {user.uid}</p>
      </div>
    );
  }

  return (
    <div className="login-page">
      <h2>Moderator Login</h2>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="dev-note">
          <h3>Development Note</h3>
          <p>
            For testing with the server's mock auth in development mode, 
            the server accepts "test-token-moderator" as a valid token.
          </p>
        </div>
      )}
    </div>
  );
};

export default Login;