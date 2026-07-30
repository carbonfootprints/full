import { lazy } from 'react';
import { createBrowserRouter, isRouteErrorResponse, useRouteError } from 'react-router-dom';

// product routes
import AdminPanelRoutes from './AdminPanelRoutes';
import CalculatorRoutes from './CalculatorRoutes';
import OrguserRoutes from './OrguserRoutes';
import PagesRoutes from './PagesRoutes';

import Loadable from 'components/Loadable';
import SimpleLayout from 'layout/Simple';

const PagesLanding = Loadable(lazy(() => import('../views/Landing')));

// ─── Inline error boundary rendered by React Router on unmatched routes ───────
function RouterErrorBoundary() {
  const error = useRouteError();
  const is404 = isRouteErrorResponse(error) && error.status === 404;

  return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '4rem', margin: 0 }}>{is404 ? '404' : '500'}</h1>
      <h2>{is404 ? 'Page not found' : 'Something went wrong'}</h2>
      <p style={{ color: '#666' }}>
        {is404
          ? "The page you're looking for doesn't exist."
          : 'An unexpected error occurred. Please try again.'}
      </p>
      <a href="/" style={{ color: '#1890ff' }}>Go home</a>
    </div>
  );
}

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <SimpleLayout />,
      errorElement: <RouterErrorBoundary />,
      children: [
        {
          index: true,
          element: <PagesLanding />
        },
        {
          path: '/landing',
          element: <PagesLanding />
        }
      ]
    },
    AdminPanelRoutes,
    CalculatorRoutes,
    OrguserRoutes,
    PagesRoutes,
    // Global 404 catch-all — must be last
    {
      path: '*',
      element: <RouterErrorBoundary />,
    },
  ],
  {
    basename: import.meta.env.VITE_APP_BASE_NAME
  }
);

export default router;
