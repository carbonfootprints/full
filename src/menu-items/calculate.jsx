const calculate = {
  id: 'group-application',
  title: 'calculate',
  type: 'group',
  children: [
    {
      id: 'structure',
      title: 'structure',
      type: 'item',
      icon: <i className="ph ph-calendar-blank" />,
      url: '/calculate/structure'
    },
    {
      id: 'calculateview',
      title: 'calculateview',
      type: 'item',
      icon: <i className="ph ph-calendar-blank" />,
      url: '/calculate/structureview'
    },
    // {
    //   id: 'visit',
    //   title: 'visit',
    //   type: 'item',
    //   icon: <i className="ph ph-calendar-blank" />,
    //   url: '/calculate/visit'
    // },
    {
      id: 'list',
      title: 'list',
      type: 'item',
      icon: <i className="ph ph-calendar-blank" />,
      url: '/calculate/list'
    },
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
          url: '/calculate/helpdesk/dashboard'
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
              url: '/calculate/helpdesk/ticket/create'
            },
            {
              id: 'helpdesk-list',
              title: 'list',
              type: 'item',
              url: '/calculate/helpdesk/ticket/list'
            },
            {
              id: 'helpdesk-details',
              title: 'details',
              type: 'item',
              url: '/calculate/helpdesk/ticket/details'
            }
          ]
        },
        {
          id: 'customers',
          title: 'customers',
          type: 'item',
          url: '/calculate/helpdesk/customers'
        }
      ]
    }
  ]
};

export default calculate;
