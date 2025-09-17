// material-ui
import { Typography, Grid, Card, CardContent, CircularProgress, Box } from '@mui/material';
import MainCard from 'components/MainCard';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchGetDataWithAuth } from 'client/client';

const palette = [
  '#4caf50', '#2196f3', '#ff9800', '#9c27b0',
  '#f44336', '#00bcd4', '#3f51b5', '#8bc34a'
];

const colorForIndex = (index) => palette[index % palette.length];

const AlbumPage = () => {
  const navigate = useNavigate();

  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      window.location.reload();
      return;
    }

    const loadAlbums = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchGetDataWithAuth('/album/albums'); // ✅ GET from backend
        setAlbums(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching albums:', err);
        setError(err?.response?.data?.message || err.message || 'Failed to fetch albums');
      } finally {
        setLoading(false);
      }
    };

    loadAlbums();
  }, [navigate]);

  const openAlbum = (albumId) => {
    navigate(`/albums/${albumId}`);
  };

  return (
    <MainCard title="Albums">
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : albums.length === 0 ? (
        <Typography>No albums found. Click "Add Album" to create one.</Typography>
      ) : (
        <Grid container spacing={2}>
          {albums.map((album, idx) => {
            const bg = colorForIndex(idx);
            const textColor = '#fff';

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={album.id ?? idx}>
                <Card
                  onClick={() => openAlbum(album.id)}
                  sx={{
                    cursor: 'pointer',
                    height: '160px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    background: `linear-gradient(135deg, ${bg} 0%, ${shadeColor(bg, -12)} 100%)`,
                    color: textColor,
                    boxShadow: 3,
                    transition: 'transform .15s ease',
                    '&:hover': { transform: 'translateY(-6px)' }
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {album.name ?? 'Untitled'}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1, opacity: 0.95 }}>
                      {album.description ? truncate(album.description, 100) : 'No description.'}
                    </Typography>
                    <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.9 }}>
                      {Array.isArray(album.photos) ? `${album.photos.length} photos` : '0 photos'}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </MainCard>
  );
};

// helper: truncate long text
function truncate(str, n) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

// helper: darken/brighten a hex color
function shadeColor(hexColor, percent) {
  try {
    const f = hexColor.slice(1);
    const t = percent < 0 ? 0 : 255;
    const p = Math.abs(percent) / 100;
    const R = parseInt(f.slice(0, 2), 16);
    const G = parseInt(f.slice(2, 4), 16);
    const B = parseInt(f.slice(4, 6), 16);
    const newR = Math.round((t - R) * p) + R;
    const newG = Math.round((t - G) * p) + G;
    const newB = Math.round((t - B) * p) + B;
    return `#${(0x1000000 + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;
  } catch (e) {
    return hexColor;
  }
}

export default AlbumPage;
