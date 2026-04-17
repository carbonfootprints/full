// project-imports
import calculate from './calculate';
import adminStruct from './admin-struct';

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
