import React, { useState } from 'react';
import { Button, Typography, Box, LinearProgress } from '@mui/material';
import { fetchUploadWithAuth } from 'client/client';

const AlbumPhotos = ({ albumId, onUploadSuccess }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one file');
      return;
    }
    setError('');
    setUploading(true);

    try {
      const data = await fetchUploadWithAuth(`/album/albums/${albumId}/upload-photos`, selectedFiles);
      console.log('Upload result:', data);

      if (onUploadSuccess) onUploadSuccess(data);
      setSelectedFiles([]);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box mt={2}>
      <Typography variant="h6">Upload Photos</Typography>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        style={{ marginTop: '8px', marginBottom: '8px' }}
      />

      {selectedFiles.length > 0 && (
        <Typography variant="body2">
          {selectedFiles.length} file(s) selected
        </Typography>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={uploading}
        sx={{ mt: 1 }}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </Button>

      {uploading && <LinearProgress sx={{ mt: 1 }} />}

      {error && <Typography color="error">{error}</Typography>}
    </Box>
  );
};

export default AlbumPhotos;
