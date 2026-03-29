const calculate = {
  id: 'group-application',
  title: 'Dashboard',
  type: 'group',
  children: [
    {
      id: 'orguser-dashboard',
      title: 'Home',
      type: 'item',
      icon: <i className="ph ph-house" />,
      url: '/orguser/dashboard'
    },
    {
      id: 'organization-setup',
      title: 'Organization Profile',
      type: 'item',
      icon: <i className="ph ph-buildings" />,
      url: '/orguser/organization-setup'
    },
    {
      id: 'sites-management',
      title: 'Sites Management',
      type: 'item',
      icon: <i className="ph ph-map-pin" />,
      url: '/orguser/sites'
    },
    {
      id: 'carbon-footprint',
      title: 'Carbon Data Entry',
      type: 'item',
      icon: <i className="ph ph-leaf" />,
      url: '/orguser/carbon-footprint'
    },
    {
      id: 'reports-section',
      title: 'Reports',
      type: 'collapse',
      icon: <i className="ph ph-file-text" />,
      children: [
        {
          id: 'overview',
          title: 'Overview',
          type: 'item',
          icon: <i className="ph ph-chart-line" />,
          url: '/calculate/structureview'
        },
        {
          id: 'detailed-report',
          title: 'Detailed Report',
          type: 'item',
          icon: <i className="ph ph-file-doc" />,
          url: '/calculate/list'
        }
      ]
    },
    {
      id: 'support',
      title: 'Support',
      type: 'collapse',
      icon: <i className="ph ph-lifebuoy" />,
      children: [
        {
          id: 'create-ticket',
          title: 'Create Ticket',
          type: 'item',
          icon: <i className="ph ph-plus-circle" />,
          url: '/calculate/helpdesk/ticket/create'
        },
        {
          id: 'my-tickets',
          title: 'My Tickets',
          type: 'item',
          icon: <i className="ph ph-ticket" />,
          url: '/calculate/helpdesk/ticket/list'
        }
      ]
    }
  ]
};

export default calculate;
