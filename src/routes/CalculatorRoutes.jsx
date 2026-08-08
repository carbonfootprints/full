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
const CreateTicket = Loadable(lazy(() => import('sections/calculator/helpdesk/tickets/Create')));
const TicketsList = Loadable(lazy(() => import('sections/calculator/helpdesk/tickets/TicketsList')));
const UserTicketDetails = Loadable(lazy(() => import('sections/calculator/helpdesk/tickets/UserTicketDetails')));
const CustomersMain = Loadable(lazy(() => import('views/pages/helpdesk/Customers')));
const DashboardMain = Loadable(lazy(() => import('views/pages/helpdesk/Dashboard')));

// render - carbon footprint calculator pages
const CategoryWizard = Loadable(lazy(() => import('sections/calculator/carbon-footprint/CategoryWizard')));
const GHGReport = Loadable(lazy(() => import('sections/calculator/carbon-footprint/GHGReport')));
const Category1_1Form = Loadable(lazy(() => import('sections/calculator/carbon-footprint/Category1_1Form')));
const Category1_2Form = Loadable(lazy(() => import('sections/calculator/carbon-footprint/Category1_2Form')));
const Category1_3Form = Loadable(lazy(() => import('sections/calculator/carbon-footprint/Category1_3Form')));
const Category1_4Form = Loadable(lazy(() => import('sections/calculator/carbon-footprint/Category1_4Form')));
const Category1_5Form = Loadable(lazy(() => import('sections/calculator/carbon-footprint/Category1_5Form')));
const Category2Form = Loadable(lazy(() => import('sections/calculator/carbon-footprint/Category2Form')));
const Category3_1Form = Loadable(lazy(() => import('sections/calculator/carbon-footprint/Category3_1Form')));
const Category3_2Form = Loadable(lazy(() => import('sections/calculator/carbon-footprint/Category3_2Form')));
const Category3_3_1Form = Loadable(lazy(() => import('sections/calculator/carbon-footprint/Category3_3_1Form')));
const Category3_3_2Form = Loadable(lazy(() => import('sections/calculator/carbon-footprint/Category3_3_2Form')));
const Category3_4_1Form = Loadable(lazy(() => import('sections/calculator/carbon-footprint/Category3_4_1Form')));
const Category3_4_2Form = Loadable(lazy(() => import('sections/calculator/carbon-footprint/Category3_4_2Form')));
const Category3_5_1Form = Loadable(lazy(() => import('sections/calculator/carbon-footprint/Category3_5_1Form')));
const Category3_5_2Form = Loadable(lazy(() => import('sections/calculator/carbon-footprint/Category3_5_2Form')));
const Category3_2_3aForm = Loadable(lazy(() => import('sections/calculator/carbon-footprint/Category3_2_3aForm')));
const Category3_2_3bForm = Loadable(lazy(() => import('sections/calculator/carbon-footprint/Category3_2_3bForm')));
const Category3_6Form = Loadable(lazy(() => import('sections/calculator/carbon-footprint/Category3_6Form')));
const Category4_7Form = Loadable(lazy(() => import('sections/calculator/carbon-footprint/Category4_7Form')));
const Category5_1Form = Loadable(lazy(() => import('sections/calculator/carbon-footprint/Category5_1Form')));
const Category5_2Form = Loadable(lazy(() => import('sections/calculator/carbon-footprint/Category5_2Form')));
const Category4_1Form = Loadable(lazy(() => import('sections/calculator/carbon-footprint/Category4_1Form')));
const Category4_2aForm = Loadable(lazy(() => import('sections/calculator/carbon-footprint/Category4_2aForm')));
const Category4_2bForm = Loadable(lazy(() => import('sections/calculator/carbon-footprint/Category4_2bForm')));
const Category4_3Form = Loadable(lazy(() => import('sections/calculator/carbon-footprint/Category4_3Form')));
const Category4_4Form = Loadable(lazy(() => import('sections/calculator/carbon-footprint/Category4_4Form')));
const Category4_5Form = Loadable(lazy(() => import('sections/calculator/carbon-footprint/Category4_5Form')));
const Category4_6Form = Loadable(lazy(() => import('sections/calculator/carbon-footprint/Category4_6Form')));

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
                      element: <CreateTicket />
                    },
                    {
                      path: 'list',
                      element: <TicketsList />
                    },
                    {
                      path: 'details/:ticketId',
                      element: <UserTicketDetails />
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
              path: 'carbon-footprint',
              children: [
                {
                  path: '',
                  element: <CategoryWizard />
                },
                {
                  path: 'category/1.1',
                  element: <Category1_1Form />
                },
                {
                  path: 'category/1.2',
                  element: <Category1_2Form />
                },
                {
                  path: 'category/1.3',
                  element: <Category1_3Form />
                },
                {
                  path: 'category/1.4',
                  element: <Category1_4Form />
                },
                {
                  path: 'category/1.6',
                  element: <Category1_5Form />
                },
                {
                  path: 'category/2',
                  element: <Category2Form />
                },
                {
                  path: 'category/3.1',
                  element: <Category3_1Form />
                },
                {
                  path: 'category/3.2',
                  element: <Category3_2Form />
                },
                {
                  path: 'category/3.3.1',
                  element: <Category3_3_1Form />
                },
                {
                  path: 'category/3.3.2',
                  element: <Category3_3_2Form />
                },
                {
                  path: 'category/3.4.1',
                  element: <Category3_4_1Form />
                },
                {
                  path: 'category/3.4.2',
                  element: <Category3_4_2Form />
                },
                {
                  path: 'category/3.5.1',
                  element: <Category3_5_1Form />
                },
                {
                  path: 'category/3.5.2',
                  element: <Category3_5_2Form />
                },
                {
                  path: 'category/3.2.3a',
                  element: <Category3_2_3aForm />
                },
                {
                  path: 'category/3.2.3b',
                  element: <Category3_2_3bForm />
                },
                {
                  path: 'category/3.6',
                  element: <Category3_6Form />
                },
                {
                  path: 'category/4.1',
                  element: <Category4_1Form />
                },
                {
                  path: 'category/4.2.a',
                  element: <Category4_2aForm />
                },
                {
                  path: 'category/4.2.b',
                  element: <Category4_2bForm />
                },
                {
                  path: 'category/4.3',
                  element: <Category4_3Form />
                },
                {
                  path: 'category/4.4',
                  element: <Category4_4Form />
                },
                {
                  path: 'category/4.5',
                  element: <Category4_5Form />
                },
                {
                  path: 'category/4.6',
                  element: <Category4_6Form />
                },
                {
                  path: 'category/4.7',
                  element: <Category4_7Form />
                },
                {
                  path: 'category/5.1',
                  element: <Category5_1Form />
                },
                {
                  path: 'category/5.2',
                  element: <Category5_2Form />
                },
                {
                  path: 'report',
                  element: <GHGReport />
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
