// ==============================|| MENU ITEMS - ADMIN PANEL ||============================== //

const adminPanel = {
  id: 'admin-panel',
  title: 'admin-panel',
  type: 'group',
  children: [
    {
      id: 'helpdesk',
      title: 'helpdesk',
      type: 'collapse',
      icon: <i className="ph ph-lifebuoy" />,
      children: [
        {
          id: 'helpdesk-dashboard',
          title: 'dashboard',
          type: 'item',
          url: '/admin-panel/helpdesk/dashboard'
        },
        {
          id: 'helpdesk-ticket',
          title: 'ticket',
          type: 'collapse',
          children: [
            {
              id: 'helpdesk-create',
              title: 'create',
              type: 'item',
              url: '/admin-panel/helpdesk/ticket/create'
            },
            {
              id: 'helpdesk-list',
              title: 'list',
              type: 'item',
              url: '/admin-panel/helpdesk/ticket/list'
            },
            {
              id: 'helpdesk-details',
              title: 'details',
              type: 'item',
              url: '/admin-panel/helpdesk/ticket/details'
            }
          ]
        },
        {
          id: 'customers',
          title: 'customers',
          type: 'item',
          url: '/admin-panel/helpdesk/customers'
        }
      ]
    },
    {
      id: 'admin-invoice',
      title: 'invoice',
      type: 'collapse',
      icon: <i className="ph ph-printer" />,
      children: [
        {
          id: 'invoice-dashboard',
          title: 'dashboard',
          type: 'item',
          url: '/admin-panel/invoice/dashboard'
        },
        {
          id: 'invoice-create',
          title: 'create',
          type: 'item',
          url: '/admin-panel/invoice/create'
        },
        {
          id: 'invoice-details',
          title: 'details',
          type: 'item',
          url: '/admin-panel/invoice/details'
        },
        {
          id: 'invoice-list',
          title: 'list',
          type: 'item',
          url: '/admin-panel/invoice/list'
        },
        {
          id: 'invoice-edit',
          title: 'edit',
          type: 'item',
          url: '/admin-panel/invoice/edit'
        }
      ]
    }
  ]
};

export default adminPanel;
