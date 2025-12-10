// project-imports
// import application from './application';
// import adminPanel from './admin-panel';
// import chartsMaps from './charts-maps';
// import formComponents from './forms';
import calculate from './calculate';
import adminStruct from './admin-struct';
// import other from './other';
// import pages from './pages';
// import uiComponents from './ui-components';
// import tableRoutes from './tables';
// import navigation from './navigation';

// ==============================|| MENU ITEMS ||============================== //
const userData = localStorage.getItem('user');
let role = null;

if (userData) {
  try {
    role = JSON.parse(userData).role; // Extract role
  } catch (e) {
    console.error('Invalid user data in localStorage');
  }
}
// const menuItems = {
//   items: [navigation, adminPanel, uiComponents, calculate, formComponents, tableRoutes, chartsMaps, application, pages, other]
// };
const menuItems = {
  items: role === 'admin' ? [adminStruct] : [calculate]
};

export default menuItems;
