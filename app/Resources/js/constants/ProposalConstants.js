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
