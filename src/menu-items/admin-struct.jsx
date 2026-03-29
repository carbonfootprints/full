const calculate = {
  id: 'group-application',
  title: 'Management',
  type: 'group',
  children: [
    {
      id: 'structure',
      title: 'Structure',
      type: 'item',
      icon: <i className="ph ph-stack" />,
      url: '/calculate/structure'
    },
    {
      id: 'organizations',
      title: 'Organizations',
      type: 'collapse',
      icon: <i className="ph ph-buildings" />,
      children: [
        {
          id: 'orguser-create',
          title: 'Create New',
          type: 'item',
          icon: <i className="ph ph-plus-circle" />,
          url: '/calculate/orguser'
        },
        {
          id: 'orguser-list',
          title: 'View All',
          type: 'item',
          icon: <i className="ph ph-list-bullets" />,
          url: '/calculate/alluser'
        }
      ]
    },
    {
      id: 'support',
      title: 'Support Tickets',
      type: 'collapse',
      icon: <i className="ph ph-headset" />,
      children: [
        {
          id: 'support-all-tickets',
          title: 'All Tickets',
          type: 'item',
          icon: <i className="ph ph-list-bullets" />,
          url: '/admin-panel/helpdesk/ticket/list'
        }
      ]
    }
  ]
};

export default calculate;
