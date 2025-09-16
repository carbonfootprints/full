import { lazy } from 'react';

// project-imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import Visit from '../sections/calculator/structure/Visit';

// render - other pages
// const OtherSamplePage = Loadable(lazy(() => import('views/SamplePage')));

// render - helpdesk pages
const CreateMain = Loadable(lazy(() => import('views/pages/helpdesk/tickets/CreateMain')));
const CustomersMain = Loadable(lazy(() => import('views/pages/helpdesk/Customers')));
const DashboardMain = Loadable(lazy(() => import('views/pages/helpdesk/Dashboard')));
const DetailsMain = Loadable(lazy(() => import('views/pages/helpdesk/tickets/DetailsMain')));
const ListMain = Loadable(lazy(() => import('views/pages/helpdesk/tickets/ListMain')));

const List = Loadable(lazy(() => import('views/pages/invoice/List.jsx')));

const Structure = Loadable(lazy(() => import('views/pages/structure/Structure.jsx')));

// ==============================|| OTHER ROUTING ||============================== //

const CalculatorRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          path: 'calculate',
          children: [
            {
              path: 'list',
              element: <List />
            },
            {
              path: 'structure',
              element: <Structure />
            },
            {
              path: 'visit/:id',
              element: <Visit />
            },
            {
              path: 'helpdesk',
              children: [
                {
                  path: 'dashboard',
                  element: <DashboardMain />
                },
                {
                  path: 'ticket',
                  children: [
                    {
                      path: 'create',
                      element: <CreateMain />
                    },
                    {
                      path: 'list',
                      element: <ListMain />
                    },
                    {
                      path: 'details',
                      element: <DetailsMain />
                    }
                  ]
                },
                {
                  path: 'customers',
                  element: <CustomersMain />
                }
              ]
            }
          ]
        }
      ]
    }
  ]
};

export default CalculatorRoutes;
