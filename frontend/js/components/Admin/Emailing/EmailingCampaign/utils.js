// @flow
import { ORDER_BY } from './DashboardCampaign/DashboardCampaign.reducer';
import type { EmailingCampaignPageQueryVariables } from '~relay/EmailingCampaignPageQuery.graphql';
import type { DashboardParameters } from './DashboardCampaign/DashboardCampaign.reducer';

export const CAMPAIGN_PAGINATION = 30;

export const createQueryVariables = (
  parameters: DashboardParameters,
  isAdmin: boolean,
): EmailingCampaignPageQueryVariables => ({
  count: CAMPAIGN_PAGINATION,
  cursor: null,
  term: parameters.filters.term,
  orderBy: {
    field: 'SEND_AT',
    direction: parameters.sort === ORDER_BY.NEWEST ? 'DESC' : 'ASC',
  },
  status: parameters.filters.state === 'ALL' ? null : parameters.filters.state,
  affiliations: isAdmin ? null : ['OWNER'],
});
