import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  List, 
  ListItem, 
  ListItemText,
  Paper,
  Alert,
} from '@mui/material';
import axios from 'axios';

const UserDashboard = () => {
  const [contents, setContents] = useState([]);
  const [error, setError] = useState('');
  const user = JSON.parse(localStorage.getItem('user'));

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

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
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
        <Paper>
          <List>
            {contents.map((content) => (
              <ListItem
                key={content.id}
                divider
              >
                <ListItemText
                  primary={content.heading}
                  secondary={
                    <React.Fragment>
                      <Typography component="span" variant="body2" color="text.primary">
                        {content.description}
                      </Typography>
                      <br />
                      <Typography component="span" variant="caption">
                        Posted by: {content.host_name} on {new Date(content.uploaded_at).toLocaleDateString()}
                      </Typography>
                    </React.Fragment>
                  }
                />
              </ListItem>
            ))}
            {contents.length === 0 && (
              <ListItem>
                <ListItemText primary="No content available" />
              </ListItem>
            )}
          </List>
        </Paper>
      </Box>
    </Container>
  );
};

export default UserDashboard; 