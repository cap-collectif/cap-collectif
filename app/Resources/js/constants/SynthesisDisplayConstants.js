export default {

  ALLOWED_RULES: {
    style: ['fontSize', 'color', 'textAlign', 'fontWeight'],
    display: ['author', 'piechart', 'counters', 'asProgressBar', 'childrenInModal']
  },

  DISPLAY_SETTINGS: [
    {
      conditions: [
        {
          type: 'level',
          value: 0,
        },
        {
          type: 'display_type',
          value: 'folder',
        },
      ],
      rules: [
        {
          category: 'style',
          name: 'fontSize',
          value: '26px',
        },
        {
          category: 'style',
          name: 'color',
          value: '#000000',
        },
        {
          category: 'style',
          name: 'textAlign',
          value: 'center',
        },
      ],
    },
    {
      conditions: [
        {
          type: 'level',
          value: 1,
        },
        {
          type: 'display_type',
          value: 'folder',
        },
      ],
      rules: [
        {
          category: 'style',
          name: 'fontSize',
          value: '22px',
        },
        {
          category: 'style',
          name: 'color',
          value: '#000000',
        },
        {
          category: 'style',
          name: 'textAlign',
          value: 'center',
        },
      ],
    },
    {
      conditions: [
        {
          type: 'level',
          value: 2,
        },
        {
          type: 'display_type',
          value: 'folder',
        },
      ],
      rules: [
        {
          category: 'style',
          name: 'fontSize',
          value: '17px',
        },
        {
          category: 'style',
          name: 'color',
          value: '#000000',
        },
        {
          category: 'style',
          name: 'textAlign',
          value: 'center',
        },
      ],
    },
    {
      conditions: [
        {
          type: 'level',
          value: 3,
        },
        {
          type: 'display_type',
          value: 'contribution',
        },
      ],
      rules: [
        {
          category: 'style',
          name: 'fontSize',
          value: '16px',
        },
        {
          category: 'style',
          name: 'fontWeight',
          value: 'bold',
        },
        {
          category: 'display',
          name: 'author',
          value: true,
        },
        {
          category: 'display',
          name: 'piechart',
          value: true,
        },
        {
          category: 'display',
          name: 'counters',
          value: true,
        },
      ],
    },
    {
      conditions: [
        {
          type: 'level',
          value: 4,
        },
        {
          type: 'display_type',
          value: 'folder',
        },
      ],
      rules: [
        {
          category: 'style',
          name: 'fontSize',
          value: '16px',
        },
        {
          category: 'style',
          name: 'fontWeight',
          value: 'bold',
        },
      ],
    },
    {
      conditions: [
        {
          type: 'level',
          value: 5,
        },
        {
          type: 'display_type',
          value: 'folder',
        },
      ],
      rules: [
        {
          category: 'display',
          name: 'asProgressBar',
          value: true,
        },
        {
          category: 'display',
          name: 'childrenInModal',
          value: true,
        },
      ],
    },
  ],
};
