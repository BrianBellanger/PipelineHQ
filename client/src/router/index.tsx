import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    // AppLayout with auth guard will wrap this in Phase 1
    element: <DashboardPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
