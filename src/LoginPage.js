import React, { useCallback, useState } from 'react';
import {
  Typography,
  Box,
  TextField,Button,
  CircularProgress,
  Paper,
} from '@mui/material';

const LoginPage = ({ onLoginSuccess, onMessage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Hardcoded credentials for testing
  const HARDCODED_USERNAME = "test@example.com";
  const HARDCODED_PASSWORD = "password123";

  const handleLogin = useCallback(async () => {
    setLoading(true);
    try {
      if (email === HARDCODED_USERNAME && password === HARDCODED_PASSWORD) {
        // Simulate a successful login
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
        onMessage('Login successful!', 'success');
        // Create a mock user object for the App component
        onLoginSuccess({ email: HARDCODED_USERNAME, uid: 'hardcoded-user-id-123' });
      } else {
        onMessage('Invalid username or password.', 'error');
      }
    } catch (error) {
      // This catch block might not be strictly necessary for hardcoded login,
      // but is good practice for future API integration.
      onMessage('An unexpected error occurred during login.', 'error');
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  }, [email, password, onLoginSuccess, onMessage]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        p: 3,
      }}
    >
      <Paper elevation={6} sx={{ p: 4, borderRadius: 2, width: '100%', maxWidth: 400, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
          Login
        </Typography>
        <TextField
          label="Email (test@example.com)"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          autoComplete="email"
        />
        <TextField
          label="Password (password123)"
          variant="outlined"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
        />
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3, py: 1.5, fontSize: '1.1rem' }}
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
        </Button>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Use email: **test@example.com** and password: **password123**
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoginPage;