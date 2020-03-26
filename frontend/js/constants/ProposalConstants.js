// @flow
export const VOTE_TYPE_DISABLED = 0;
export const VOTE_TYPE_SIMPLE = 1;
export const VOTE_TYPE_BUDGET = 2;
export const PROPOSAL_VOTES_TO_SHOW = 6;
export const PROPOSAL_FOLLOWERS_TO_SHOW = 32;

// === order
export const PROPOSAL_ORDER_RANDOM = 'random';
export const PROPOSAL_ORDER_LAST = 'last';
export const PROPOSAL_ORDER_OLD = 'old';
export const PROPOSAL_ORDER_COMMENTS = 'comments';
export const PROPOSAL_ORDER_COST_EXPENSIVE = 'expensive';
export const PROPOSAL_ORDER_COST_CHEAP = 'cheap';

export const PROPOSAL_AVAILABLE_ORDERS = [
  PROPOSAL_ORDER_RANDOM,
  PROPOSAL_ORDER_LAST,
  PROPOSAL_ORDER_OLD,
];

export const PROPOSAL_STATUS = {
  TODO: {
    icon: 'task-list-pin-1',
    label: 'global.filter_to.do',
    color: '#3B88FD',
  },
  IN_PROGRESS: {
    icon: 'construction-cone',
    label: 'step.status.open',
    color: '#F09200',
  },
  LATE: {
    icon: 'Time Clock Circle Alternate',
    label: 'global.filter_belated',
    color: '#6C757D',
  },
  SILENT: {
    icon: 'Smiley-silent',
    label: 'global.filter_not-pronounced',
    color: '#17A2B8', // vert d'eau
  },
  IN_FAVOUR: {
    icon: 'Check Circle 1 Alternate',
    label: 'global.favorable',
    color: '#28A745',
  },
  AGAINST: {
    icon: 'Close',
    label: 'global.filter-unfavourable',
    color: '#DC3545',
  },
};
