// @flow
import React, { PropTypes } from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import { IntlMixin } from 'react-intl';
import ContributionPaginatedList, {
  pageSize,
} from './ContributionPaginatedList';
import environment, { graphqlError } from '../../createRelayEnvironment';
import Loader from '../Utils/Loader';

export const ConsultationContributionFiltered = React.createClass({
  propTypes: {
    consultationId: PropTypes.string.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { consultationId } = this.props;
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
        query ConsultationContributionFilteredQuery($consultationId: ID!, $count: Int!, $cursor: String) {
          consultations(id: $consultationId) {
            ...ContributionPaginatedList_consultation
          }
        }
        `}
        variables={{ consultationId, count: pageSize, cursor: null }}
        render={({ error, props }) => {
          if (error) {
            console.log(error); // eslint-disable-line no-console
            return graphqlError;
          }
          if (props) {
            if (props.consultations.length) {
              return (
                <ContributionPaginatedList
                  consultation={props.consultations[0]}
                />
              );
            }
            return graphqlError;
          }
          return <Loader />;
        }}
      />
    );
  },
});

export default ConsultationContributionFiltered;
