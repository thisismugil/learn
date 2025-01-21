import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  List, 
  ListItem, 
  ListItemText,
  Paper,
  Alert,
  TextField
} from '@mui/material';
import axios from 'axios';

const HostDashboard = () => {
  const [textContent, setTextContent] = useState({
    heading: '',
    description: ''
  });
  const [uploadedContents, setUploadedContents] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTextContent(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpload = async () => {
    if (!textContent.heading || !textContent.description) {
      setError('Please provide both heading and description');
      return;
    }

    try {
      const response = await axios.post('http://localhost:8000/api/user/upload-content/', {
        heading: textContent.heading,
        description: textContent.description
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
          description: ''
        });
      }
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.response?.data?.error || 'Error uploading content');
    }
  };

  // Fetch uploaded contents when component mounts
  React.useEffect(() => {
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

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
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
            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={!textContent.heading || !textContent.description}
            >
              Upload Content
            </Button>
          </Box>
        </Paper>

        <Typography variant="h6" gutterBottom>
          Your Uploaded Contents
        </Typography>
        <Paper>
          <List>
            {uploadedContents.map((content, index) => (
              <ListItem key={index} divider>
                <ListItemText 
                  primary={content.heading}
                  secondary={
                    <React.Fragment>
                      <Typography component="span" variant="body2" color="text.primary">
                        {content.description}
                      </Typography>
                      <br />
                      <Typography component="span" variant="caption">
                        Uploaded on: {new Date(content.uploaded_at).toLocaleDateString()}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItem>
            ))}
            {uploadedContents.length === 0 && (
              <ListItem>
                <ListItemText primary="No content uploaded yet" />
              </ListItem>
            )}
          </List>
        </Paper>
      </Box>
    </Container>
  );
};

export default HostDashboard; 