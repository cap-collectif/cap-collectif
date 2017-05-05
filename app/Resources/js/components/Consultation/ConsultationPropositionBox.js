// @flow
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay';
// import { Panel } from 'react-bootstrap';
import { IntlMixin } from 'react-intl';
import environment from '../../createRelayEnvironment';
// import ConsultationFilterForm from './ConsultationFilterForm';
import SectionRecursiveList from './SectionRecursiveList';
import Loader from '../Utils/Loader';

const ConsultationPropositionBox = React.createClass({
  propTypes: {
    step: React.PropTypes.object.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { step } = this.props;
    return (
      <div>
        {/* <Panel>
          <span>
            Filtres de recherche
          </span>
          <span className="pull-right">
            <ConsultationFilterForm />
          </span>
        </Panel> */}
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
            consultationId: step.id,
          }}
          render={({ error, props }) => {
            if (error) {
              return <div>{error.message}</div>;
            }
            if (props) {
              return (
                <SectionRecursiveList
                  consultation={step}
                  sections={props.consultations[0].sections}
                />
              );
            }
            return <Loader />;
          }}
        />
      </div>
    );
  },
});

export default ConsultationPropositionBox;
