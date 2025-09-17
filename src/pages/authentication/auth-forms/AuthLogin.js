import React, { useEffect, useState } from 'react';
import { Container, TextField, Button  } from '@mui/material';
import {fetchPostData} from 'client/client';
import { useNavigate } from 'react-router-dom';


const AuthLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('token');
    if (isLoggedIn) {
      navigate('/');
    }
  }, [navigate]);
  
  const validateEmail = () => {
     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
     return emailRegex.test(email);
  };

  const validatePassword = () => {
    return password.length >= 6 && password.length <= 20;
  };

  const handleLogin = async () => {
    setError({ email: '', password: '' });

    if (!validateEmail()) {
      setError(prev => ({ ...prev, email: 'Invalid email format' }));
    
    }
    if (!validatePassword()) {
      setError(prev => ({ ...prev, password: 'Password must be 6-20 characters long' }));
    }

    fetchPostData("/auth/token",{email,password})
    .then((response) => {
      const { token } = response.data;
      setLoginError('');
      localStorage.setItem('token', token);
       navigate('/');
        window.location.reload()


      }) .catch((error) => {
        console.error('Login error:', error);
        // Handle other login errors
        setLoginError('An error occurred during login');
  });
  };



  return (
    <Container component="main" maxWidth="xs">
      <TextField
      variant="outlined"
      margin="normal"
      fullWidth
      id="email"
      label="Email Address"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      error={!!error.email}
      helperText={error.email}
      />

      <TextField
      variant="outlined"
      margin="normal"
      fullWidth
      id="password"
      label="Password"
      type="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      error={!!error.password}
      helperText={error.password}
      />

       <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleLogin}
        sx={{ mt: 2 }}
      >
        Login
      </Button>
       {loginError && <p style={{ color: 'red' }}>{loginError}</p>}
    </Container>
  )
  
};

export default AuthLogin;
