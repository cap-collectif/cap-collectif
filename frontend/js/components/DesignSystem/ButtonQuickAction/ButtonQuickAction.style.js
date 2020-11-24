// @flow
import colors from '~/styles/modules/colors';

const styles = {
  default: {
    outline: 'none',

    ':hover': {
      backgroundColor: colors.blue['150'],

      '.icon': {
        fill: colors.blue['500'],
      },

      ':focus': {
        boxShadow: `0 0 2px 2px ${colors.blue['300']}`,
      },
    },

    ':focus': {
      boxShadow: `0 0 2px 2px ${colors.gray['300']}`,
    },
  },
  danger: {
    outline: 'none',

    ':hover': {
      backgroundColor: colors.red['150'],

      '.icon': {
        fill: colors.red['500'],
      },

      ':focus': {
        boxShadow: `0 0 2px 2px ${colors.red['300']}`,
      },
    },

    ':focus': {
      boxShadow: `0 0 2px 2px ${colors.gray['300']}`,
    },
  },
};

export default styles;
