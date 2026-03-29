import { lazy } from 'react';

// project-imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import AuthLayout from 'layout/Auth';

// render - orguser auth pages
const OrguserLogin = Loadable(lazy(() => import('views/orguser/OrguserLogin')));
const OrguserRegistration = Loadable(lazy(() => import('views/orguser/OrguserRegistration')));

// render - orguser dashboard pages
const OrguserDashboard = Loadable(lazy(() => import('views/orguser/OrguserDashboard')));
const OrganizationSetup = Loadable(lazy(() => import('views/orguser/OrganizationSetup')));
const CarbonFootprintData = Loadable(lazy(() => import('views/orguser/CarbonFootprintData')));
const CarbonReportDownload = Loadable(lazy(() => import('views/orguser/CarbonReportDownload')));

// ==============================|| ORGUSER ROUTING ||============================== //

const OrguserRoutes = {
  path: '/',
  children: [
    // Public routes (no authentication required)
    {
      path: '/',
      element: <AuthLayout />,
      children: [
        {
          path: 'orguser',
          children: [
            {
              path: 'login',
              element: <OrguserLogin />
            }
          ]
        },
        {
          path: 'register',
          children: [
            {
              path: ':token',
              element: <OrguserRegistration />
            }
          ]
        }
      ]
    },
    // Protected routes (authentication required)
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          path: 'orguser',
          children: [
            {
              path: 'dashboard',
              element: <OrguserDashboard />
            },
            {
              path: 'organization-setup',
              element: <OrganizationSetup />
            },
            {
              path: 'sites',
              element: <OrganizationSetup /> // Same component, just different tab
            },
            {
              path: 'carbon-footprint',
              element: <CarbonFootprintData />
            },
            {
              path: 'report',
              element: <CarbonReportDownload />
            }
          ]
        }
      ]
    }
  ]
};

export default OrguserRoutes;
