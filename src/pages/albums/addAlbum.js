// src/pages/albums/AddAlbum.js
import React, { useEffect, useState } from 'react';
import { Container, TextField, Button } from '@mui/material';
import { fetchPostDataWithAuth } from 'client/client';
import { useNavigate } from 'react-router-dom';

const AddAlbum = () => {
  const navigate = useNavigate();

  // form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // validation & submit state
  const [errors, setErrors] = useState({ name: '', description: '' });
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // redirect to login if no token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const validate = () => {
    const newErrors = { name: '', description: '' };
    let ok = true;

    if (!name.trim()) {
      newErrors.name = 'Album name is required';
      ok = false;
    } else if (name.trim().length > 100) {
      newErrors.name = 'Album name must be 100 characters or fewer';
      ok = false;
    }

    if (description.trim().length > 500) {
      newErrors.description = 'Description must be 500 characters or fewer';
      ok = false;
    }

    setErrors(newErrors);
    return ok;
  };

  const handleAddAlbum = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    setSubmitError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = { name: name.trim(), description: description.trim() };

      // Use the client utility that attaches token header
      // Make sure your backend route matches - here I use '/albums/add'
      const data = await fetchPostDataWithAuth('/album/add', payload);

      // success: navigate back to albums list (or wherever you want)
      console.log('Album created:', data);
      navigate('/albums');         // go to albums list
      // optional: if you must refresh list, use state management or page reload:
      // window.location.reload();
    } catch (err) {
      console.error('Add album error:', err);
      // Prefer server error message if available
      const serverMessage = err?.response?.data?.message || err?.message || 'Failed to add album';
      setSubmitError(serverMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <h2>Add Album</h2>

      <form onSubmit={handleAddAlbum} noValidate>
        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="album-name"
          label="Album Name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!errors.name}
          helperText={errors.name}
        />

        <TextField
          variant="outlined"
          margin="normal"
          fullWidth
          id="album-description"
          label="Description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={!!errors.description}
          helperText={errors.description}
          multiline
          minRows={3}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          onClick={handleAddAlbum}
          disabled={submitting}
          sx={{ mt: 2 }}
        >
          {submitting ? 'Adding...' : 'Add Album'}
        </Button>

        {submitError && <p style={{ color: 'red', marginTop: 12 }}>{submitError}</p>}
      </form>
    </Container>
  );
};

export default AddAlbum;
