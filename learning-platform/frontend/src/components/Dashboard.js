import React from 'react';
import { Container, Typography } from '@mui/material';

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome {user?.username}!
      </Typography>
      <Typography variant="body1">
        You are logged in as: {user?.user_type}
      </Typography>
    </Container>
  );
};

export default Dashboard; 