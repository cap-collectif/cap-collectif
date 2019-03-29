// @flow
import * as React from 'react';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import ContributionPaginatedList, { pageSize } from './ContributionPaginatedList';
import environment, { graphqlError } from '../../createRelayEnvironment';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import type { ConsultationContributionFilteredQueryResponse } from './__generated__/ConsultationContributionFilteredQuery.graphql';

const renderConsultationPaginated = ({
  error,
  props,
}: { props: ?ConsultationContributionFilteredQueryResponse } & ReadyState) => {
  if (error) {
    console.log(error); // eslint-disable-line no-console
    return graphqlError;
  }
  if (props) {
    if (props.consultations && props.consultations.length) {
      // $FlowFixMe
      return <ContributionPaginatedList consultation={props.consultations[0]} />;
    }
    return graphqlError;
  }
  return <Loader />;
};

type Props = {
  consultationId: string,
};

export class ConsultationContributionFiltered extends React.Component<Props> {
  render() {
    const { consultationId } = this.props;
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query ConsultationContributionFilteredQuery(
            $consultationId: ID!
            $count: Int!
            $cursor: String
          ) {
            consultations(id: $consultationId) {
              ...ContributionPaginatedList_consultation
            }
          }
        `}
        variables={{ consultationId, count: pageSize, cursor: null }}
        render={renderConsultationPaginated}
      />
    );
  }
}

export default ConsultationContributionFiltered;
