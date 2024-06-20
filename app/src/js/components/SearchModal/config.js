const config = {
  role: {
    title: 'Roles',
    path: 'data/roles',
    primary: 'id',
    fields: [
      {
        heading: 'Long Name',
        field: 'long_name',
        searchable: true,
        sortable: true
      },
      {
        heading: 'Short Name',
        field: 'short_name',
        searchable: true,
        sortable: true
      }
    ]
  },
  group: {
    title: 'Groups',
    path: 'data/groups',
    primary: 'id',
    fields: [
      {
        heading: 'Long Name',
        field: 'long_name',
        searchable: true,
        sortable: true
      },
      {
        heading: 'Short Name',
        field: 'short_name',
        searchable: true,
        sortable: true
      }
    ]
  },
  user: {
    title: 'Users',
    path: 'data/users',
    primary: 'id',
    fields: [
      {
        heading: 'Name',
        field: 'name',
        searchable: true,
        sortable: true
      }
    ]
  }
};

export default config;
