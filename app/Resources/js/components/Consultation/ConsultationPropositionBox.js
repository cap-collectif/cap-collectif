// @flow
import * as React from 'react';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import environment, { graphqlError } from '../../createRelayEnvironment';
// import ConsultationFilterForm from './ConsultationFilterForm';
// import ConsultationContributionFiltered
//   from './ConsultationContributionFiltered';
import SectionRecursiveList from './SectionRecursiveList';
import Loader from '../Utils/Loader';
import type { ConsultationPropositionBoxQueryResponse } from './__generated__/ConsultationPropositionBoxQuery.graphql';

type Props = {
  step: { id: string },
};

export class ConsultationPropositionBox extends React.Component<Props> {
  render() {
    const { step } = this.props;
    const renderSectionRecursiveList = ({
      error,
      props,
    }: { props: ?ConsultationPropositionBoxQueryResponse } & ReadyState) => {
      if (error) {
        console.log(error); // eslint-disable-line no-console
        return graphqlError;
      }
      if (props) {
        if (props.consultations[0].sections) {
          return (
            // $FlowFixMe Propably libdef issue.
            <SectionRecursiveList consultation={step} sections={props.consultations[0].sections} />
          );
        }
        return graphqlError;
      }
      // $FlowFixMe Propably libdef issue.
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
  }
}

export default ConsultationPropositionBox;
