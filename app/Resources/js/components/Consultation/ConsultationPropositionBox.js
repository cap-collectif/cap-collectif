// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import type { GlobalState, Dispatch } from '../../types';
import { changeConsultationPlanActiveItems } from '../../redux/modules/project';
import environment, { graphqlError } from '../../createRelayEnvironment';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import type {
  ConsultationPropositionBoxQueryResponse,
  ConsultationPropositionBoxQueryVariables,
} from '~relay/ConsultationPropositionBoxQuery.graphql';
import ConsultationPropositionStep from './ConsultationPropositionStep';

export type OwnProps = {|
  +id: string,
|};

type Props = {|
  ...OwnProps,
  +showConsultationPlan: boolean,
  +dispatch: Dispatch,
  +consultationPlanEnabled: boolean,
  +isAuthenticated: boolean,
|};

type State = {|
  +currentActiveItems: Array<string>,
|};

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
    window.removeEventListener('scroll', this.animationFrame, false);
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
    const { id, showConsultationPlan, consultationPlanEnabled, isAuthenticated } = this.props;

    const renderSectionRecursiveList = ({
      error,
      props,
    }: {
      ...ReadyState,
      props: ?ConsultationPropositionBoxQueryResponse,
    }) => {
      if (error) {
        console.log(error); // eslint-disable-line no-console
        return graphqlError;
      }
      if (props) {
        if (props.consultationStep) {
          const { consultationStep } = props;
          return (
            // $FlowFixMe
            <ConsultationPropositionStep
              consultationPlanEnabled={consultationPlanEnabled}
              showConsultationPlan={showConsultationPlan}
              consultationStep={consultationStep}
            />
          );
        }
        return graphqlError;
      }
      return <Loader />;
    };

    return (
      <div className="row">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ConsultationPropositionBoxQuery(
              $consultationStepId: ID!
              $isAuthenticated: Boolean!
            ) {
              consultationStep: node(id: $consultationStepId) {
                ...ConsultationPropositionStep_consultationStep
              }
            }
          `}
          variables={
            ({
              consultationStepId: id,
              isAuthenticated,
            }: ConsultationPropositionBoxQueryVariables)
          }
          render={renderSectionRecursiveList}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: GlobalState, props: Props) => ({
  showConsultationPlan:
    props.id in state.project.showConsultationPlanById
      ? state.project.showConsultationPlanById[props.id]
      : true,
  consultationPlanEnabled: state.default.features.consultation_plan,
  isAuthenticated: !!state.user.user,
});

export default connect(mapStateToProps)(ConsultationPropositionBox);
