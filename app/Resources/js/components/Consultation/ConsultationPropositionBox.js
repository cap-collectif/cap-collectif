// @flow
import * as React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import type { GlobalState } from '../../types';
import environment, { graphqlError } from '../../createRelayEnvironment';
// import ConsultationFilterForm from './ConsultationFilterForm';
// import ConsultationContributionFiltered
//   from './ConsultationContributionFiltered';
import SectionRecursiveList from './SectionRecursiveList';
import Loader from '../Ui/Loader';
import RemainingTime from './../Utils/RemainingTime';
import DatesInterval from './../Utils/DatesInterval';
import StepInfos from '../../components/Steps/Page/StepInfos';
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
};

export class ConsultationPropositionBox extends React.Component<Props> {

  componentDidMount() {
    window.addEventListener('scroll', () => {
      window.requestAnimationFrame(() => {
        this.getActiveLink();
      });
    });

    // const planWidth = document.getElementById('consultation-plan').getBoundingClientRect().width;
    // const plan = document.getElementById('consultNav');
    //
    // if(plan && planWidth) {
    //   plan.style.width = planWidth;
    // }
    //
    // console.log(plan, planWidth);
  }

  getActiveLink() {
    const sectionItems = document.querySelectorAll('.opinion-type__title');

    sectionItems.forEach((item) => {
      const navItem = document.getElementById(`nav-${item.id}`);
      const itemPosition = item.getBoundingClientRect();

      if(navItem && navItem.parentNode) {
        // 50 is height of nav
        if(
          ((itemPosition.top - 60) < 0)
          && ((itemPosition.top - 60) > -itemPosition.height)
        ){
          // id is passed on children of navItem component
          navItem.parentNode.classList.add('active');
        } else {
          navItem.parentNode.classList.remove('active');
        }
      }
    });
  }

  // componentWillUnmount() {
  // add removeEventListener
  // }

  // componentDidUpdate() {
  //   const planWidth = document.getElementById('consultation-plan').getBoundingClientRect().width;
  //   const plan = document.getElementById('consultationNav');
  //
  //   if(plan && planWidth) {
  //     plan.style.width = planWidth;
  //   }
  //
  //   console.log(plan && plan.style.width);
  // }

  render() {
    const { step, showConsultationPlan } = this.props;

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
            // $FlowFixMe
            <SectionRecursiveList consultation={props.consultation} />
          );
        }
        return graphqlError;
      }
      return <Loader />;
    };

    return (
      <div className="row">
        <div className={showConsultationPlan ? 'consultation-plan col-sm-3 col-xs-12' : 'consultation-plan'} id="consultation-plan">
          <ConsultationPlan step={step} />
        </div>
        <div id="scroll-content" className={showConsultationPlan ? 'col-sm-9' : 'col-xs-10 col-xs-offset-1'}>
          {/* <Panel>
            <span>
              Filtres de recherche
            </span>
            <span className="pull-right">
              <ConsultationFilterForm />
            </span>
          </Panel> */}
          {/* <ConsultationContributionFiltered consultationId={step.id} /> */}
          <h2 className="text-center">{step.title}</h2>
          <div className="mb-30 project__step-dates text-center">
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
                consultation: node(id: $consultationId) {
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

const mapStateToProps: MapStateToProps<*, *, *> = (state: GlobalState, props: Props) => ({
  showConsultationPlan: props.step.id in state.project.showConsultationPlanById ? state.project.showConsultationPlanById[props.step.id] : true,
});

export default connect(mapStateToProps)(ConsultationPropositionBox);
