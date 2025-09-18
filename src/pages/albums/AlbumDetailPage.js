// src/pages/albums/AlbumDetailPage.js
import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CircularProgress,
  Dialog,
  IconButton
} from '@mui/material';
import AlbumPhotos from './AlbumPhotos';
import { fetchGetDataWithAuth } from 'client/client';

// Build full URL from backend link (handles missing base / trailing slash)
const buildFullUrl = (link) => {
  const base = process.env.REACT_APP_API_BASE_URL || '';
  if (!link) return '';
  if (base.endsWith('/') && link.startsWith('/')) return base.slice(0, -1) + link;
  if (!base.endsWith('/') && !link.startsWith('/')) return base + '/' + link;
  return base + link;
};

const AlbumDetailPage = () => {
  const { id } = useParams();
  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [thumbMap, setThumbMap] = useState({}); // { photoId: objectUrl }
  const [fullMap, setFullMap] = useState({});   // { photoId: objectUrl }
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // revoke created object URLs
      Object.values(thumbMap).forEach((u) => u && URL.revokeObjectURL(u));
      Object.values(fullMap).forEach((u) => u && URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAlbum = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchGetDataWithAuth(`/album/albums/${id}`);
      console.debug('Album data loaded:', data);
      if (!mountedRef.current) return;
      setAlbum(data || null);
      if (Array.isArray(data?.photos) && data.photos.length > 0) {
        preloadThumbnails(data.photos);
      }
    } catch (err) {
      console.error('Failed to load album:', err);
      if (!mountedRef.current) return;
      setError(err?.response?.data?.message || err.message || 'Failed to load album');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    loadAlbum();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // fetch image blob with Authorization header if token present
  const fetchImageBlobWithAuth = async (url) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No auth token found in localStorage');
    }

    const headers = { Authorization: `Bearer ${token}` };
    const resp = await fetch(url, { method: 'GET', headers });
    if (!resp.ok) {
      const msg = `Image fetch failed: ${resp.status} ${resp.statusText}`;
      const body = await resp.text().catch(() => '');
      console.warn('Image fetch response body:', body);
      const err = new Error(msg);
      err.status = resp.status;
      throw err;
    }
    return await resp.blob();
  };

  // preload thumbnails; if photo.link missing, build fallback path
  const preloadThumbnails = async (photos = []) => {
    // log photos for debugging
    console.debug('preloadThumbnails photos:', photos);
    const entries = await Promise.all(
      photos.map(async (photo) => {
        const photoId = photo.id;
        // fallback to constructed link if backend didn't provide it
        const link = photo.link || `/album/albums/${id}/photos/${photoId}/download-photo`;
        const thumbnailUrlTry = buildFullUrl(`${link}?thumbnail=true`);
        const fallbackUrl = buildFullUrl(link);

        try {
          const blob = await fetchImageBlobWithAuth(thumbnailUrlTry);
          const objUrl = URL.createObjectURL(blob);
          return [photoId, objUrl];
        } catch (e1) {
          // if thumbnail fails, try the full image
          try {
            const blob2 = await fetchImageBlobWithAuth(fallbackUrl);
            const objUrl2 = URL.createObjectURL(blob2);
            return [photoId, objUrl2];
          } catch (e2) {
            console.warn(`Failed to load thumbnail/full for photo ${photoId}`, e2);
            return [photoId, '']; // show placeholder text instead
          }
        }
      })
    );

    if (!mountedRef.current) return;
    const map = Object.fromEntries(entries);
    setThumbMap((prev) => ({ ...prev, ...map }));
  };

  const openLightbox = async (photo) => {
    setLightboxPhoto({ loading: true });
    // if already fetched full image, show it
    if (fullMap[photo.id]) {
      setLightboxPhoto({ ...photo, url: fullMap[photo.id], loading: false });
      return;
    }

    const link = photo.link || `/album/albums/${id}/photos/${photo.id}/download-photo`;
    const url = buildFullUrl(link);

    try {
      const blob = await fetchImageBlobWithAuth(url);
      const objUrl = URL.createObjectURL(blob);
      if (!mountedRef.current) return;
      setFullMap((prev) => ({ ...prev, [photo.id]: objUrl }));
      setLightboxPhoto({ ...photo, url: objUrl, loading: false });
    } catch (err) {
      console.error('Failed to fetch full image', err);
      let message = 'Failed to load image';
      if (err.status === 401 || err.status === 403) {
        message = `Not authorized to fetch image (status ${err.status}). Check token or server permissions.`;
      }
      setLightboxPhoto({ ...photo, url: '', loading: false, error: message });
    }
  };

  const closeLightbox = () => setLightboxPhoto(null);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) return <Typography color="error">{error}</Typography>;
  if (!album) return <Typography>No album data</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {album.name ?? `Album ${id}`}
      </Typography>

      {album.description && (
        <Typography variant="body1" color="textSecondary" gutterBottom>
          {album.description}
        </Typography>
      )}

      <AlbumPhotos albumId={id} onUploadSuccess={() => loadAlbum()} />

      <Box mt={3}>
        <Typography variant="h6" gutterBottom>
          Photos
        </Typography>

        {Array.isArray(album.photos) && album.photos.length === 0 && (
          <Typography>No photos yet. Upload some above.</Typography>
        )}

        <Grid container spacing={2}>
          {Array.isArray(album.photos) &&
            album.photos.map((photo) => {
              const thumbUrl = thumbMap[photo.id] || '';
              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={photo.id}>
                  <Card sx={{ cursor: 'pointer' }} onClick={() => openLightbox(photo)}>
                    <Box
                      sx={{
                        height: 160,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: '#f8f8f8'
                      }}
                    >
                      {thumbUrl ? (
                        <CardMedia
                          component="img"
                          src={thumbUrl}
                          alt={photo.name}
                          sx={{ height: '100%', width: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#aaa'
                          }}
                        >
                          {photo.name || 'thumbnail'}
                        </Box>
                      )}
                    </Box>

                    <CardContent>
                      <Typography variant="subtitle1" noWrap>
                        {photo.name || 'Untitled'}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
        </Grid>
      </Box>

      <Dialog open={!!lightboxPhoto} onClose={closeLightbox} maxWidth="lg" fullWidth>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
          <IconButton onClick={closeLightbox} aria-label="close">
            <span style={{ fontSize: 20, lineHeight: 1 }}>✕</span>
          </IconButton>
        </Box>

        <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          {lightboxPhoto?.loading ? (
            <CircularProgress />
          ) : lightboxPhoto?.error ? (
            <Typography color="error">{lightboxPhoto.error}</Typography>
          ) : (
            <img
              src={lightboxPhoto?.url}
              alt={lightboxPhoto?.name || 'photo'}
              style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
            />
          )}
        </Box>
      </Dialog>
    </Box>
  );
};

export default AlbumDetailPage;
