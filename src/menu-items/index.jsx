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

// Function to get menu items dynamically based on current user
const getMenuItems = () => {
  const userData = localStorage.getItem('user');
  const userType = localStorage.getItem('userType');
  let role = null;

  if (userData) {
    try {
      const parsedUser = JSON.parse(userData);
      role = parsedUser.role; // Extract role
    } catch (e) {
      console.error('Invalid user data in localStorage');
    }
  }

  // Determine menu based on user role or userType
  let menuConfig = [calculate]; // Default for regular users

  if (role === 'admin' || role === 'superadmin') {
    menuConfig = [adminStruct];
  } else if (role === 'orguser' || userType === 'orguser') {
    menuConfig = [calculate];
  }

  return {
    items: menuConfig
  };
};

// Export default as function result for backward compatibility
const menuItems = getMenuItems();

export default menuItems;
export { getMenuItems };
