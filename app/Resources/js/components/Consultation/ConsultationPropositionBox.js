// @flow
import * as React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import type { GlobalState, Dispatch } from '../../types';
import { changeConsultationPlanActiveItem } from '../../redux/modules/project';
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
  dispatch: Dispatch,
};

export class ConsultationPropositionBox extends React.Component<Props> {
  componentDidMount() {
    window.addEventListener('scroll', () => {
      window.requestAnimationFrame(() => {
        // this.getActiveLink();
        this.scrollSpy();
      });
    });
  }

  // getActiveLink() {
  //   const sectionItems = document.querySelectorAll('.opinion-type__title');
  //
  //   sectionItems.forEach(item => {
  //     const navItem = document.getElementById(`nav-${item.id}`);
  //     const itemPosition = item.getBoundingClientRect();
  //     const parentItem = navItem && navItem.parentNode;
  //     const nextSiblingItem = parentItem && parentItem.nextSibling;
  //
  //     if (navItem && parentItem) {
  //       // 50 is height of nav
  //       if (itemPosition.top - 20 < 0 && itemPosition.top - 20 > -itemPosition.height + 40) {
  //         // id is passed on children of navItem component
  //         // $FlowFixMe
  //         parentItem.classList.add('active');
  //         $(nextSiblingItem).collapse({ toggle: true });
  //         // console.log(nextSiblingItem);
  //       } else {
  //         // $FlowFixMe
  //         parentItem.classList.remove('active');
  //         // $(nextSiblingItem).collapse({ toggle: false });
  //       }
  //     }
  //   });
  // }

  scrollSpy = () => {
    const { dispatch } = this.props;
    const sectionItems = document.querySelectorAll('.section-list_container');
    const actifItems = [];

    sectionItems.forEach(item => {
      const itemPosition = item.getBoundingClientRect();

      if (itemPosition) {
        // 50 is height of nav
        if ((itemPosition.top - 20 < 0) && (itemPosition.top - 20 > -itemPosition.height + 40)) {
          actifItems.push(item.id);
        } else {
          // console.warn(item);
        }
      }
    });

    if(actifItems.length > 0) {
      //  const actifItem = Math.max.apply(null, actifItemArray);
      dispatch(changeConsultationPlanActiveItem(actifItems));
    }
  };

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
        <div
          className={
            showConsultationPlan
              ? 'consultation-plan col-sm-3 col-xs-12  hidden-xs'
              : 'consultation-plan  hidden-xs'
          }
          id="consultation-plan">
          <ConsultationPlan step={step} />
        </div>
        <div
          id="scroll-content"
          className={showConsultationPlan ? 'col-sm-9' : 'col-xs-10 col-xs-offset-1'}>
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
  showConsultationPlan:
    props.step.id in state.project.showConsultationPlanById
      ? state.project.showConsultationPlanById[props.step.id]
      : true,
});

export default connect(mapStateToProps)(ConsultationPropositionBox);
