// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import type { GlobalState, Dispatch } from '../../types';
import { changeConsultationPlanActiveItems } from '../../redux/modules/project';
import environment, { graphqlError } from '../../createRelayEnvironment';
import SectionRecursiveList from './SectionRecursiveList';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import RemainingTime from '../Utils/RemainingTime';
import DatesInterval from '../Utils/DatesInterval';
import StepInfos from '../Steps/Page/StepInfos';
import type { ConsultationPropositionBoxQueryResponse } from './__generated__/ConsultationPropositionBoxQuery.graphql';
import ConsultationPlan from './ConsultationPlan';

type Step = {
  id: string,
  title: string,
  startAt: ?string,
  endAt: ?string,
  timeless: boolean,
  status: string,
};

type Props = {
  step: Step,
  showConsultationPlan: boolean,
  dispatch: Dispatch,
  consultationPlanEnabled: boolean,
};

type State = {
  currentActiveItems: Array<string>,
};

let Stickyfill;

export class ConsultationPropositionBox extends React.Component<Props, State> {
  state = {
    currentActiveItems: [],
  };

  componentDidMount() {
    // eslint-disable-next-line
    Stickyfill = require('stickyfilljs');

    window.addEventListener('scroll', this.animationFrame, false);

    const elements = document.querySelectorAll('.sticky');
    Stickyfill.add(elements);
  }

  componentWillUnmount() {
    window.removeListener('scroll', this.animationFrame, false);
  }

  animationFrame = () => {
    window.requestAnimationFrame(() => {
      this.scrollSpy();
    });
  };

  scrollSpy = () => {
    const { dispatch } = this.props;
    const sectionItems = document.querySelectorAll('.section-list_container');
    const activeItems = [];

    sectionItems.forEach(item => {
      const itemPosition = item.getBoundingClientRect();
      const navHeight = 40;

      if (
        itemPosition &&
        itemPosition.top - 20 < 0 &&
        itemPosition.top - 20 > -itemPosition.height + navHeight
      ) {
        activeItems.push(item.id);
      }
    });

    if (JSON.stringify(activeItems) !== JSON.stringify(this.state.currentActiveItems)) {
      dispatch(changeConsultationPlanActiveItems(activeItems));
    }

    this.setState({ currentActiveItems: activeItems });
  };

  render() {
    const { step, showConsultationPlan, consultationPlanEnabled } = this.props;

    const renderSectionRecursiveList = ({
      error,
      props,
    }: { props: ?ConsultationPropositionBoxQueryResponse } & ReadyState) => {
      if (error) {
        console.log(error); // eslint-disable-line no-console
        return graphqlError;
      }
      if (props) {
        if (props.consultation) {
          return (
            <div>
              {/* $FlowFixMe $refType */}
              <StepInfos step={props.consultation} />
              {/* $FlowFixMe */}
              <SectionRecursiveList consultation={props.consultation} />
            </div>
          );
        }
        return graphqlError;
      }
      return <Loader />;
    };

    return (
      <div className="row">
        {consultationPlanEnabled && (
          <div
            className={
              showConsultationPlan
                ? 'consultation-plan sticky col-md-3 col-sm-12'
                : 'consultation-plan sticky'
            }
            id="consultation-plan">
            <ConsultationPlan step={step} />
          </div>
        )}
        <div
          id="scroll-content"
          className={
            consultationPlanEnabled && showConsultationPlan
              ? 'col-md-9'
              : 'col-md-10 col-md-offset-1'
          }>
          <h2 className="text-center">{step.title}</h2>
          <div className="mb-30 project__step-dates text-center">
            {(step.startAt || step.endAt) && (
              <div className="mr-15 d-ib">
                <i className="cap cap-calendar-2-1" />{' '}
                <DatesInterval startAt={step.startAt} endAt={step.endAt} fullDay />
              </div>
            )}
            {step.endAt && step.status === 'OPENED' && !step.timeless && (
              <div className="mr-15 d-ib">
                <i className="cap cap-hourglass-1" /> <RemainingTime endAt={step.endAt} />
              </div>
            )}
          </div>
          <QueryRenderer
            environment={environment}
            query={graphql`
              query ConsultationPropositionBoxQuery($consultationId: ID!) {
                consultation: node(id: $consultationId) {
                  ...StepInfos_step
                  ...SectionRecursiveList_consultation
                }
              }
            `}
            variables={{
              consultationId: step.id,
            }}
            render={renderSectionRecursiveList}
          />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState, props: Props) => ({
  showConsultationPlan:
    props.step.id in state.project.showConsultationPlanById
      ? state.project.showConsultationPlanById[props.step.id]
      : true,
  consultationPlanEnabled: state.default.features.consultation_plan,
});

export default connect(mapStateToProps)(ConsultationPropositionBox);
