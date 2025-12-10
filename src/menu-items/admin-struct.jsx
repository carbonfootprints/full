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
      id: 'orguser',
      title: 'Create User',
      type: 'item',
      icon: <i className="ph ph-calendar-blank" />,
      url: '/calculate/orguser'
    },
    {
      id: 'alluser',
      title: 'All Users',
      type: 'item',
      icon: <i className="ph ph-calendar-blank" />,
      url: '/calculate/alluser'
    }
  ]
};

export default calculate;
