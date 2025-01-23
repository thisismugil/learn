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
  TextField,
  AppBar,
  Toolbar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const HostDashboard = () => {
  const [textContent, setTextContent] = useState({
    heading: '',
    description: '',
    price: ''
  });
  const [uploadedContents, setUploadedContents] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTextContent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpload = async () => {
    if (!textContent.heading || !textContent.description || !textContent.price) {
      setError('Please provide heading, description, and price');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/user/upload-content/', {
        heading: textContent.heading,
        description: textContent.description,
        price: textContent.price
      }, {
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('tokens')).access}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.content) {
        setUploadedContents(prev => [...prev, response.data.content]);
        setSuccess('Content uploaded successfully!');
        setError('');
        setTextContent({
          heading: '',
          description: '',
          price: ''
        });
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Error uploading content');
    }
  };

  // Fetch uploaded contents when component mounts
  useEffect(() => {
    const fetchContents = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/user/host-contents/${user.id}/`, {
          headers: {
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('tokens')).access}`
          }
        });
        setUploadedContents(response.data.contents);
      } catch (err) {
        setError('Error fetching contents');
      }
    };
    fetchContents();
  }, [user.id]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
    navigate('/login/host');
  };

  return (
    <Box sx={{ width: '100%', height: '100vh' }}>
      <AppBar position="static" color="transparent">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Host Dashboard
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
          Host Dashboard
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Upload New Content
          </Typography>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Heading"
              name="heading"
              value={textContent.heading}
              onChange={handleInputChange}
              fullWidth
              required
              variant="outlined"
            />
            <TextField
              label="Description"
              name="description"
              value={textContent.description}
              onChange={handleInputChange}
              fullWidth
              required
              multiline
              rows={4}
              variant="outlined"
            />
            <TextField
              label="Price"
              name="price"
              value={textContent.price}
              onChange={handleInputChange}
              fullWidth
              required
              variant="outlined"
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={!textContent.heading || !textContent.description || !textContent.price}
            >
              Upload Content
            </Button>
          </Box>
        </Paper>

        <Typography variant="h6" gutterBottom>
          Your Uploaded Contents
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
          {uploadedContents.map((content, index) => (
            <Card key={index} sx={{ width: '100%', maxWidth: 345 }}>
              <CardContent>
                <Typography variant="h5" component="div">
                  {content.heading}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {content.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Price: ${content.price}
                </Typography>
                <Typography variant="caption" display="block" gutterBottom>
                  Uploaded on: {new Date(content.uploaded_at).toLocaleDateString()}
                </Typography>
              </CardContent>
              <CardActions>
                {/* Add any actions if needed */}
              </CardActions>
            </Card>
          ))}
          {uploadedContents.length === 0 && (
            <Paper sx={{ p: 2 }}>
              <Typography>No content uploaded yet</Typography>
            </Paper>
          )}
        </Box>
      </Container>
    </Box>
  );
};

export default HostDashboard;