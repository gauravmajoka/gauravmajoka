// src/routes/MainRoutes.js
import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import MainLayout from 'layout/MainLayout';

const AlbumPage = Loadable(lazy(() => import('pages/albums/albums')));
const AboutPage = Loadable(lazy(() => import('pages/staticPages/about')));
const AddAlbum = Loadable(lazy(() => import('pages/albums/addAlbum')));
const AlbumDetailPage = Loadable(lazy(() => import('pages/albums/AlbumDetailPage')));

// ==============================|| MAIN ROUTING ||============================== //
const MainRoutes = {
  path: '/',           // parent route
  element: <MainLayout />,
  children: [
    { path: 'albums', element: <AlbumPage /> }, // <- no leading slash
    { path: 'about',  element: <AboutPage /> } , // <- no leading slash
    {path: 'albums/add', element: <AddAlbum />} ,
    { path: 'albums/:id', element: <AlbumDetailPage /> }
  ]
};

export default MainRoutes;
