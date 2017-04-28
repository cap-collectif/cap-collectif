// @flow
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import { Panel } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import environment from '../../createRelayEnvironment';
import ConsultationFilterForm from './ConsultationFilterForm';
import SectionRecursiveList from './SectionRecursiveList';

const ConsultationPropositionBox = React.createClass({
  propTypes: {
    consultationId: React.PropTypes.string.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { consultationId } = this.props;
    return (
      <div>
        <Panel>
          <span>
            Filtres de recherche
          </span>
          <span className="pull-right">
            <ConsultationFilterForm />
          </span>
        </Panel>
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ConsultationPropositionBoxQuery($consultationId: ID!) {
              consultations(id: $consultationId) {
                sections {
                  ...SectionRecursiveList_sections
                }
              }
            }
          `}
          variables={{
            consultationId,
          }}
          render={({ error, props }) => {
            if (error) {
              return <div>{error.message}</div>;
            }
            if (props) {
              return (
                <SectionRecursiveList
                  // consultationId={props.consultations[0].id}
                  // consultationProjectId={props.consultations[0].projectId}
                  sections={props.consultations[0].sections}
                />
              );
            }
            return <div>Loading</div>;
          }}
        />
      </div>
    );
  },
});

export default ConsultationPropositionBox;
