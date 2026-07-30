import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

// product routes only — template demos removed
import AdminPanelRoutes from './AdminPanelRoutes';
import CalculatorRoutes from './CalculatorRoutes';
import OrguserRoutes from './OrguserRoutes';

import Loadable from 'components/Loadable';
import SimpleLayout from 'layout/Simple';

const PagesLanding = Loadable(lazy(() => import('../views/Landing')));

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <SimpleLayout />,
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
  ],
  {
    basename: import.meta.env.VITE_APP_BASE_NAME
  }
);

export default router;
