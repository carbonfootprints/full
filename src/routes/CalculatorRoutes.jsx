import { lazy } from 'react';

// project-imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import Visit from '../sections/calculator/structure/Visit';
import Category from '../sections/calculator/structure/Category';
import StructureView from '../sections/calculator/structure/StructureView';
import VisitForm from '../sections/calculator/structure/VisitForm';
import UserMain from '../sections/calculator/structure/UserMain';
import OrgUser from '../sections/calculator/orguser/OrgUser';
import AllUser from '../sections/calculator/orguser/AllUser';

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
              path: 'orguser',
              element: <OrgUser />
            },
            {
              path: 'alluser',
              element: <AllUser />
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
              path: 'category/:struid/:id',
              element: <Category />
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
            },
            {
              path: 'structureview',
              element: <StructureView />
            },
            {
              path: 'usermain/:id',
              element: <UserMain />
            }
          ]
        }
      ]
    }
  ]
};

export default CalculatorRoutes;
