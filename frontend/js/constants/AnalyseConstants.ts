import { ICON_NAME } from '~ui/Icons/Icon'
import colors from '~/utils/colors'

export const PROPOSAL_STATUS = {
  TODO: {
    name: 'todo',
    icon: ICON_NAME.todo,
    label: 'global.filter_to.do',
    color: colors.blue,
  },
  IN_PROGRESS: {
    name: 'in progress',
    icon: ICON_NAME.inProgress,
    label: 'step.status.open',
    color: colors.orange,
  },
  TOO_LATE: {
    name: 'too late',
    icon: ICON_NAME.clock,
    label: 'global.filter_belated',
    color: colors.secondaryGray,
  },
  NONE: {
    name: 'none',
    icon: ICON_NAME.silent,
    label: 'global.filter_not-pronounced',
    color: colors.duckBlue,
  },
  FAVOURABLE: {
    name: 'favourable',
    icon: ICON_NAME.favorable,
    label: 'global.favorable',
    color: colors.lightGreen,
  },
  DONE: {
    name: 'done',
    icon: ICON_NAME.favorable,
    label: 'global.favorable',
    color: colors.lightGreen,
  },
  UNFAVOURABLE: {
    name: 'unfavourable',
    icon: ICON_NAME.unfavorable,
    label: 'global.filter-unfavourable',
    color: colors.dangerColor,
  },
}
export const TYPE_ACTION = {
  ANALYST: 'ANALYST',
  SUPERVISOR: 'SUPERVISOR',
  DECISION_MAKER: 'DECISION',
}
export const TYPE_ROLE = {
  ANALYST: 'ANALYST',
  SUPERVISOR: 'SUPERVISOR',
  DECISION_MAKER: 'DECISION',
}
export const SHOWING_STEP_TYPENAME = ['CollectStep', 'SelectionStep']
