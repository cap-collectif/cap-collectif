// @flow
import React, { PropTypes } from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import environment, { graphqlError } from '../../createRelayEnvironment';
// import ConsultationFilterForm from './ConsultationFilterForm';
// import ConsultationContributionFiltered
//   from './ConsultationContributionFiltered';
import SectionRecursiveList from './SectionRecursiveList';
import Loader from '../Utils/Loader';

export const ConsultationPropositionBox = React.createClass({
  propTypes: {
    step: PropTypes.object.isRequired,
  },

  render() {
    const { step } = this.props;
    const renderSectionRecursiveList = ({
      error,
      props,
    }: {
      error: ?Error,
      props: ?{ consultations: Array<{ sections: Array<Object> }> },
    }) => {
      if (error) {
        console.log(error); // eslint-disable-line no-console
        return graphqlError;
      }
      if (props) {
        // eslint-disable-next-line react/prop-types
        if (props.consultations[0].sections) {
          return (
            <SectionRecursiveList consultation={step} sections={props.consultations[0].sections} />
          );
        }
        return graphqlError;
      }
      return <Loader />;
    };
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
        {/* <ConsultationContributionFiltered consultationId={step.id} /> */}
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
          render={renderSectionRecursiveList}
        />
      </div>
    );
  },
});

export default ConsultationPropositionBox;
