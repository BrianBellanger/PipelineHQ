import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { ProjectListPage } from '@/features/projects/ProjectListPage';
import { ProjectNewPage } from '@/features/projects/ProjectNewPage';
import { ProjectDetailPage } from '@/features/projects/ProjectDetailPage';
import { ReviewQueuePage } from '@/features/reviews/ReviewQueuePage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/projects', element: <ProjectListPage /> },
      { path: '/projects/new', element: <ProjectNewPage /> },
      { path: '/projects/:id', element: <ProjectDetailPage /> },
      { path: '/reviews', element: <ReviewQueuePage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
