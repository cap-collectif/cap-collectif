// @flow
import { ICON_NAME } from '~ui/Icons/Icon';
import colors from '~/utils/colors';

export const PROPOSAL_STATUS = {
  TODO: {
    icon: ICON_NAME.todo,
    label: 'global.filter_to.do',
    color: '#3B88FD',
  },
  IN_PROGRESS: {
    icon: ICON_NAME.inProgress,
    label: 'step.status.open',
    color: colors.orange,
  },
  TOO_LATE: {
    icon: ICON_NAME.clock,
    label: 'global.filter_belated',
    color: colors.secondaryGray,
  },
  NONE: {
    icon: ICON_NAME.silent,
    label: 'global.filter_not-pronounced',
    color: colors.duckBlue,
  },
  FAVOURABLE: {
    icon: ICON_NAME.favorable,
    label: 'global.favorable',
    color: colors.lightGreen,
  },
  DONE: {
    icon: ICON_NAME.favorable,
    label: 'global.favorable',
    color: colors.lightGreen,
  },
  UNFAVOURABLE: {
    icon: ICON_NAME.unfavorable,
    label: 'global.filter-unfavourable',
    color: colors.dangerColor,
  },
};

export const TYPE_ACTION = {
  ANALYST: 'ANALYST',
  SUPERVISOR: 'SUPERVISOR',
  DECISION_MAKER: 'DECISION',
};
