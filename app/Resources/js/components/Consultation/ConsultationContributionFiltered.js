// @flow
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import { IntlMixin } from 'react-intl';
import ContributionPaginatedList from './ContributionPaginatedList';
import environment from '../../createRelayEnvironment';
import Loader from '../Utils/Loader';

export const ConsultationContributionFiltered = React.createClass({
  propTypes: {
    consultationId: React.PropTypes.number.isRequired,
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
        variables={{ consultationId, count: 2, cursor: null }}
        render={({ error, props }) => {
          if (error) {
            console.log(error); // eslint-disable-line no-console
            return (
              <p className="text-danger">
                Désolé une erreur s'est produite… Réessayez plus tard.
              </p>
            );
          }
          if (props) {
            return (
              <ContributionPaginatedList
                consultation={props.consultations[0]}
              />
            );
          }
          return <Loader />;
        }}
      />
    );
  },
});

export default ConsultationContributionFiltered;
