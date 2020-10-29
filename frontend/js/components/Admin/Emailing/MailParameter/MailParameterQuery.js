// @flow
import * as React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import environment, { graphqlError } from '~/createRelayEnvironment';
import type { MailParameterQueryQueryResponse } from '~relay/MailParameterQueryQuery.graphql';
import MailParameterPage from './MailParameterPage';
import Loader from '~ui/FeedbacksIndicators/Loader';

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

const MailParameterQuery = ({ id }: Props) => (
  <QueryRenderer
    environment={environment}
    variables={{ emailingCampaignId: id }}
    query={graphql`
      query MailParameterQueryQuery($emailingCampaignId: ID!) {
        ...MailParameterPage_query
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

export default MailParameterQuery;
