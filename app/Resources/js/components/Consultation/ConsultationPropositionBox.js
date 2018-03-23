// @flow
import * as React from 'react';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import environment, { graphqlError } from '../../createRelayEnvironment';
// import ConsultationFilterForm from './ConsultationFilterForm';
// import ConsultationContributionFiltered
//   from './ConsultationContributionFiltered';
import SectionRecursiveList from './SectionRecursiveList';
import Loader from '../Utils/Loader';
import RemainingTime from './../Utils/RemainingTime';
import DatesInterval from './../Utils/DatesInterval';
import StepInfos from '../../components/Steps/Page/StepInfos';
import type { ConsultationPropositionBoxQueryResponse } from './__generated__/ConsultationPropositionBoxQuery.graphql';

type Step = {
  id: string,
  title: string,
  startAt: ?string,
  endAt: ?string,
  timeless: boolean,
};

type Props = {
  step: Step,
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
            // $FlowFixMe
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
        <h2>{step.title}</h2>
        <div className="mb-30 project__step-dates">
          {(step.startAt || step.endAt) && (
            <div className="mr-15 d-ib">
              <i className="cap cap-calendar-2-1" />{' '}
              <DatesInterval startAt={step.startAt} endAt={step.endAt} fullDay />
            </div>
          )}
          {step.endAt &&
            step.status === 'open' &&
            !step.timeless && (
              <div className="mr-15 d-ib">
                <i className="cap cap-hourglass-1" /> <RemainingTime endAt={step.endAt} />
              </div>
            )}
        </div>

        <StepInfos step={step} />
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
