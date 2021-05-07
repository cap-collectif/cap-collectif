// @flow
import colors from '~/styles/modules/colors';
import typography from '~/styles/theme/typography';
import { styles as stylesLink } from '~ds/Link/Link';

const styles = (isLoading?: boolean, alternative?: boolean) => ({
  common: {
    outline: 'none',
  },
  primary: {
    primary: {
      bg: 'blue.500',
      color: 'blue.100',

      '.icon': {
        color: 'white',
      },

      '&:hover': {
        bg: 'blue.700',
        color: 'blue.100',

        '&:focus': {
          boxShadow: `0 0 2px 2px ${colors.blue['300']}`,
        },
      },

      '&:focus': {
        boxShadow: `0 0 2px 2px ${colors.blue['300']}`,
      },

      '&:disabled': {
        bg: 'blue.150',
        color: 'blue.300',

        '.icon': {
          color: 'blue.300',
        },
      },

      ...(isLoading && {
        bg: 'blue.150',
        color: 'blue.300',
        'pointer-events': 'none',

        '.icon': {
          color: 'blue.300',
        },
      }),
    },
    secondary: {
      bg: 'white',
      color: 'blue.500',
      border: 'button',
      borderColor: 'blue.500',

      '.icon': {
        color: 'blue.500',
      },

      '&:hover': {
        color: 'blue.700',
        borderColor: 'blue.700',

        '&:focus': {
          boxShadow: `0 0 2px 2px ${colors.blue['300']}`,
        },

        '.icon': {
          color: 'blue.700',
        },
      },

      '&:focus': {
        boxShadow: `0 0 2px 2px ${colors.blue['300']}`,
      },

      '&:disabled': {
        color: 'blue.300',
        borderColor: 'blue.300',

        '.icon': {
          color: 'blue.300',
        },
      },

      ...(isLoading && {
        color: 'blue.300',
        borderColor: 'blue.300',
        'pointer-events': 'none',

        '.icon': {
          color: 'blue.300',
        },
      }),
    },
    tertiary: {
      bg: 'transparent',
      color: 'blue.500',
      p: 0,
      textTransform: alternative ? 'uppercase' : 'initial',
      fontSize: alternative ? typography.fontSizes[1] : typography.fontSizes[3],

      '.icon': {
        color: 'blue.500',
      },

      '&:hover': {
        color: 'blue.700',

        '&:focus': {
          boxShadow: `0 0 2px 2px ${colors.blue['300']}`,
        },

        '.icon': {
          color: 'blue.700',
        },
      },

      '&:focus': {
        boxShadow: `0 0 2px 2px ${colors.blue['300']}`,
      },

      '&:disabled': {
        color: 'blue.300',

        '.icon': {
          color: 'blue.300',
        },
      },

      ...(isLoading && {
        color: 'blue.300',
        'pointer-events': 'none',

        '.icon': {
          color: 'blue.300',
        },
      }),
    },
    link: {
      ...stylesLink.primary,
      fontWeight: 'Normal',

      '&:disabled': {
        color: 'blue.300',
        cursor: 'default',
      },
    },
  },
  danger: {
    primary: {
      bg: 'red.500',
      color: 'red.100',

      '&:hover': {
        bg: 'red.700',
        color: 'red.100',

        '&:focus': {
          boxShadow: `0 0 2px 2px ${colors.red['300']}`,
        },
      },

      '&:focus': {
        boxShadow: `0 0 2px 2px ${colors.red['300']}`,
      },

      '&:disabled': {
        bg: 'red.300',
      },

      '.icon': {
        color: 'white',
      },

      ...(isLoading && {
        bg: 'red.300',
        'pointer-events': 'none',

        '.icon': {
          color: 'red.100',
        },
      }),
    },
    secondary: {
      bg: 'white',
      color: 'red.500',
      border: 'button',
      borderColor: 'red.500',

      '&:hover': {
        color: 'red.700',
        borderColor: 'red.700',

        '&:focus': {
          boxShadow: `0 0 2px 2px ${colors.red['300']}`,
        },

        '.icon': {
          color: 'red.700',
        },
      },

      '&:focus': {
        boxShadow: `0 0 2px 2px ${colors.red['300']}`,
      },

      '&:disabled': {
        color: 'red.300',
        borderColor: 'red.300',

        '.icon': {
          color: 'red.300',
        },
      },

      '.icon': {
        color: 'red.500',
      },

      ...(isLoading && {
        color: 'red.300',
        borderColor: 'red.300',
        'pointer-events': 'none',

        '.icon': {
          color: 'red.300',
        },
      }),
    },
    tertiary: {
      bg: 'transparent',
      color: 'red.500',
      p: 0,
      textTransform: alternative ? 'uppercase' : 'initial',
      fontSize: alternative ? typography.fontSizes[1] : typography.fontSizes[3],

      '&:hover': {
        color: 'red.700',

        '&:focus': {
          boxShadow: `0 0 2px 2px ${colors.red['300']}`,
        },

        '.icon': {
          color: 'red.700',
        },
      },

      '&:focus': {
        boxShadow: `0 0 2px 2px ${colors.red['300']}`,
      },

      '&:disabled': {
        color: 'red.300',

        '.icon': {
          color: 'red.300',
        },
      },

      '.icon': {
        color: 'red.500',
      },

      ...(isLoading && {
        color: 'red.300',
        'pointer-events': 'none',

        '.icon': {
          color: 'red.300',
        },
      }),
    },
    link: {
      ...stylesLink.danger,
      fontWeight: 'Normal',

      '&:disabled': {
        color: 'red.300',
        cursor: 'default',
      },
    },
  },
  hierarchy: {
    primary: {
      bg: 'gray.500',
      color: 'gray.100',

      '.icon': {
        color: 'gray.100',
      },

      '&:hover': {
        bg: 'gray.700',
        color: 'gray.100',

        '&:focus': {
          boxShadow: `0 0 2px 2px ${colors.gray['300']}`,
        },
      },

      '&:focus': {
        boxShadow: `0 0 2px 2px ${colors.gray['300']}`,
      },

      '&:disabled': {
        bg: 'gray.150',
        color: 'gray.300',

        '.icon': {
          color: 'gray.300',
        },
      },

      ...(isLoading && {
        bg: 'gray.150',
        color: 'gray.300',
        'pointer-events': 'none',

        '.icon': {
          color: 'gray.300',
        },
      }),
    },
    secondary: {
      bg: 'white',
      color: 'gray.500',
      border: 'button',
      borderColor: 'gray.500',

      '.icon': {
        color: 'gray.500',
      },

      '&:hover': {
        color: 'gray.700',
        borderColor: 'gray.700',

        '&:focus': {
          boxShadow: `0 0 2px 2px ${colors.gray['300']}`,
        },

        '.icon': {
          color: 'gray.700',
        },
      },

      '&:focus': {
        boxShadow: `0 0 2px 2px ${colors.gray['300']}`,
      },

      '&:disabled': {
        color: 'gray.300',
        borderColor: 'gray.300',

        '.icon': {
          color: 'gray.300',
        },
      },

      ...(isLoading && {
        color: 'gray.300',
        borderColor: 'gray.300',
        'pointer-events': 'none',

        '.icon': {
          color: 'gray.300',
        },
      }),
    },
    tertiary: {
      bg: 'transparent',
      color: 'gray.500',
      p: 0,

      '.icon': {
        color: 'gray.500',
      },

      '&:hover': {
        color: 'gray.700',

        '&:focus': {
          boxShadow: `0 0 2px 2px ${colors.gray['300']}`,
        },

        '.icon': {
          color: 'gray.700',
        },
      },

      '&:focus': {
        boxShadow: `0 0 2px 2px ${colors.gray['300']}`,
      },

      '&:disabled': {
        color: 'gray.300',

        '.icon': {
          color: 'gray.300',
        },
      },

      ...(isLoading && {
        color: 'gray.300',
        'pointer-events': 'none',

        '.icon': {
          color: 'gray.300',
        },
      }),
    },
    link: {
      ...stylesLink.hierarchy,
      fontWeight: 'Normal',

      '&:disabled': {
        color: 'gray.300',
        cursor: 'default',
      },
    },
  },
});

export default styles;
