// @flow
export const ALLOWED_RULES = {
  style: ['fontSize', 'color', 'textAlign', 'fontWeight'],
  containerStyle: ['borderTop', 'paddingTop'],
  display: [
    'author',
    'piechart',
    'counters',
    'asProgressBar',
    'childrenInModal',
    'subtitle',
    'percentage',
    'expanded',
    'foldersOrderedByCount',
    'noChildrenSorting',
  ],
};

export const DISPLAY_SETTINGS = [
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
      {
        category: 'display',
        name: 'subtitle',
        value: 'true',
      },
      {
        category: 'display',
        name: 'expanded',
        value: 'true',
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
      {
        category: 'display',
        name: 'subtitle',
        value: 'true',
      },
      {
        category: 'display',
        name: 'expanded',
        value: 'true',
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
      {
        category: 'display',
        name: 'subtitle',
        value: 'true',
      },
      {
        category: 'display',
        name: 'foldersOrderedByCount',
        value: 'true',
      },
    ],
  },
  {
    conditions: [
      {
        type: 'contributions_level_delta',
        value: 0,
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
        category: 'containerStyle',
        name: 'borderTop',
        value: '5px solid #dddddd',
      },
      {
        category: 'containerStyle',
        name: 'paddingTop',
        value: '15px',
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
      {
        category: 'display',
        name: 'expanded',
        value: 'true',
      },
    ],
  },
  {
    conditions: [
      {
        type: 'contributions_level_delta',
        value: 0,
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
  {
    conditions: [
      {
        type: 'contributions_level_delta',
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
        value: '16px',
      },
      {
        category: 'style',
        name: 'fontWeight',
        value: 'bold',
      },
      {
        category: 'display',
        name: 'percentage',
        value: true,
      },
      {
        category: 'display',
        name: 'expanded',
        value: 'true',
      },
      {
        category: 'display',
        name: 'foldersOrderedByCount',
        value: 'true',
      },
    ],
  },
  {
    conditions: [
      {
        type: 'contributions_level_delta',
        value: 2,
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
];
