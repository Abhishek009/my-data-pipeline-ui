import React, { useCallback, useState } from 'react';
//import { loginUser } from './api/DataApi'; // Adjust the import path as necessary
import { loginUser } from '../src/api/DataApi.tsx';

import {
  Typography,
  Box,
  TextField,Button,
  CircularProgress,
  Paper,
} from '@mui/material';

// const client = {
//   post: async (url, data, config) => {
//     console.log(`Mock Axios POST to: ${url}`);
//     console.log('Request Data:', data);
//     await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

//     // Simulate different API responses based on credentials
//     if (data.email === "qwerty" && data.password === "asd") {
//       return {
//         data: { success: true, user: { email: data.email, uid: 'user-abc-123', token: 'mock-jwt-token' } },
//         status: 200,
//         statusText: 'OK',
//         headers: {},
//         config: config,
//         request: {}
//       };
//     } else {
//       // Simulate an error response (e.g., 401 Unauthorized)
//       // Axios typically throws an error object with a 'response' property for non-2xx codes
//       throw {
//         response: {
//           data: { success: false, message: 'Invalid credentials provided.' },
//           status: 401,
//           statusText: 'Unauthorized',
//           headers: {},
//           config: config,
//           request: {}
//         }
//       };
//     }
//   }
// };

const config = {
  headers: {
    'Content-Type': 'application/json'
  }
};

// // The loginUser function provided by the user
// export const loginUser = async(email,password) => {
//   try{
//     const data = {
//         "email": email,
//         "password": password,
//     };
    
//     const response = await client.post("/login",data,config)
//   console.log("======",response.data )
//     return response.data; 
//   }catch(error) {
//     // Propagate a consistent error object that handleLogin can use
//     console.error("Error logging user:",error.response ? error.response.data : error.message)
//     throw error.response ? error.response.data : { success: false, message: error.message || "Network error or unexpected issue." };
//   }
// }

const LoginPage = ({ onLoginSuccess, onMessage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    setLoading(true);
    try {

      const result = await loginUser(email,password) 

   
      console.log("Response is ", result);
      console.log(result.success)
      if (result.success) {
        onMessage('Login successful!', 'success');
        // Store user info in localStorage for session persistence
        localStorage.setItem('user', JSON.stringify(result.user));
        onLoginSuccess(result.user); // Pass the user object to App component
      } else {
        onMessage(result.message || 'Login failed. Please try again.', 'error');
      }

    } catch (error) {
      onMessage('An unexpected error occurred during login. Please check your network.', 'error');
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