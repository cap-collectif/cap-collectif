// @flow
import * as React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import { useSelector } from 'react-redux';
import environment, { graphqlError } from '~/createRelayEnvironment';
import type { MailParameterQueryQueryResponse } from '~relay/MailParameterQueryQuery.graphql';
import MailParameterPage from './MailParameterPage';
import Loader from '~ui/FeedbacksIndicators/Loader';
import type { GlobalState } from '~/types';

export type Props = {|
  id: string,
|};

const renderComponent = ({
  error,
  props,
}: {
  ...ReactRelayReadyState,
  props: ?MailParameterQueryQueryResponse,
}) => {
  if (error) return graphqlError;

  if (props && props.emailingCampaign) {
    const { emailingCampaign } = props;
    return <MailParameterPage emailingCampaign={emailingCampaign} query={props} />;
  }

  return <Loader />;
};

const MailParameterQuery = ({ id }: Props) => {
  const { user } = useSelector((state: GlobalState) => state.user);
  const isAdmin = user ? user.isAdmin : false;

  return (
    <QueryRenderer
      environment={environment}
      variables={{
        emailingCampaignId: id,
        affiliations: isAdmin ? null : ['OWNER'],
      }}
      query={graphql`
        query MailParameterQueryQuery(
          $emailingCampaignId: ID!
          $affiliations: [MailingListAffiliation!]
        ) {
          ...MailParameterPage_query @arguments(affiliations: $affiliations)
          emailingCampaign: node(id: $emailingCampaignId) {
            ... on EmailingCampaign {
              ...MailParameterPage_emailingCampaign
            }
          }
        }
      `}
      render={renderComponent}
    />
  );
};

export default MailParameterQuery;
