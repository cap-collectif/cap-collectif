// @flow
import colors from '~/styles/modules/colors';
import { styles as stylesLink } from '~ds/Link/Link';

const styles = (alternative?: boolean) => ({
  common: {
    outline: 'none',
  },
  primary: {
    primary: {
      bg: 'blue.500',
      color: 'blue.100',

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

      '.icon': {
        color: 'white',
      },
    },
    secondary: {
      bg: 'white',
      color: 'blue.500',
      border: 'button',
      borderColor: 'blue.500',

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

      '.icon': {
        color: 'blue.500',
      },
    },
    tertiary: {
      bg: 'transparent',
      color: 'blue.500',
      p: 0,
      textTransform: alternative ? 'uppercase' : 'initial',

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

      '.icon': {
        color: 'blue.500',
      },
    },
    link: {
      ...stylesLink,
      bg: 'transparent',
      p: 0,
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
    },
    tertiary: {
      bg: 'transparent',
      color: 'red.500',
      p: 0,
      textTransform: alternative ? 'uppercase' : 'initial',

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
    },
    link: {
      ...stylesLink,
      bg: 'transparent',
      color: 'red.500',
      p: 0,
      fontWeight: 'Normal',

      '&:hover': {
        color: 'red.700',

        '&:focus': {
          boxShadow: `0 0 2px 2px ${colors.red['300']}`,
        },
      },

      '&:focus': {
        boxShadow: `0 0 2px 2px ${colors.red['300']}`,
      },

      '&:disabled': {
        color: 'red.300',
        cursor: 'default',
      },
    },
  },
});

export default styles;
