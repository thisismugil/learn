import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Alert,
} from '@mui/material';

const Login = () => {
  const [formData, setFormData] = useState({
    login: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { userType } = useParams();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/api/user/login/', {
        ...formData,
        user_type: userType,
      });

      localStorage.setItem('tokens', JSON.stringify(response.data.tokens));
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      navigate(userType === 'host' ? '/host-dashboard' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Login as {userType}
        </Typography>
        {error && <Alert severity="error" sx={{ mt: 2, width: '100%' }}>{error}</Alert>}
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username or Email"
            name="login"
            autoComplete="email"
            autoFocus
            value={formData.login}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Login
          </Button>
          <Link 
            href={`/register/${userType}`} 
            variant="body2"
            sx={{ display: 'block', textAlign: 'center' }}
          >
            Don't have an account? Register
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;