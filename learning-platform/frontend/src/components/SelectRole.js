import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box } from '@mui/material';

const SelectRole = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5" sx={{ mb: 5, fontWeight: 'bold' }}>
          Select Your Role
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/login/user')}
            sx={{ width: '100px' }}
          >
            User
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/login/host')}
            sx={{ width: '100px' }}
          >
            Host
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default SelectRole;