import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Card, 
  CardContent, 
  CardActions, 
  Paper,
  Alert,
  AppBar,
  Toolbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const UserDashboard = () => {
  const [contents, setContents] = useState([]);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContents = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/user/available-contents/', {
          headers: {
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('tokens')).access}`
          }
        });
        setContents(response.data.contents);
      } catch (err) {
        setError('Error fetching contents');
      }
    };
    fetchContents();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
    navigate('/login/user');
  };

  return (
    <Box sx={{ width: '100%', height: '100vh' }}>
      <AppBar position="static" color="transparent">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            User Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome {user?.username}!
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          User Dashboard
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Available Contents
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {contents.map((content) => (
            <Card key={content.id} sx={{ width: '100%', maxWidth: 345 }}>
              <CardContent>
                <Typography variant="h5" component="div">
                  {content.heading}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {content.description}
                </Typography>
                <Typography variant="caption" display="block" gutterBottom>
                  Posted by: {content.host_name} on {new Date(content.uploaded_at).toLocaleDateString()}
                </Typography>
              </CardContent>
              <CardActions>
                {/* Add any actions if needed */}
              </CardActions>
            </Card>
          ))}
          {contents.length === 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography>No content available</Typography>
            </Paper>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default UserDashboard;