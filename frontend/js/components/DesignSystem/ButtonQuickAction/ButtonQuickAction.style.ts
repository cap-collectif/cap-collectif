// @ts-nocheck
import colors from '~/styles/modules/colors'

const styles = {
  primary: {
    outline: 'none',
    '&:hover': {
      backgroundColor: colors.blue['150'],
      '.icon': {
        color: colors.blue['500'],
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
    '&:hover': {
      backgroundColor: colors.red['150'],
      '.icon': {
        color: colors.red['500'],
      },
      ':focus': {
        boxShadow: `0 0 2px 2px ${colors.red['300']}`,
      },
    },
    ':focus': {
      boxShadow: `0 0 2px 2px ${colors.gray['300']}`,
    },
  },
  green: {
    outline: 'none',
    '&:hover': {
      backgroundColor: colors.green['150'],
      '.icon': {
        color: colors.green['500'],
      },
      ':focus': {
        boxShadow: `0 0 2px 2px ${colors.green['300']}`,
      },
    },
    ':focus': {
      boxShadow: `0 0 2px 2px ${colors.gray['300']}`,
    },
  },
}
export default styles
