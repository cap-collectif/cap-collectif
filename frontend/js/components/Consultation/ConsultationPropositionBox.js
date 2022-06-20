// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { graphql, QueryRenderer } from 'react-relay';
import type { Dispatch, GlobalState, RelayGlobalId } from '../../types';
import { changeConsultationPlanActiveItems } from '../../redux/modules/project';
import environment, { graphqlError } from '../../createRelayEnvironment';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import type {
  ConsultationPropositionBoxQueryResponse,
  ConsultationPropositionBoxQueryVariables,
} from '~relay/ConsultationPropositionBoxQuery.graphql';
import ConsultationPropositionStep from './ConsultationPropositionStep';

export type OwnProps = {|
  +id: RelayGlobalId,
  +consultationSlug: string,
|};

type Props = {|
  ...OwnProps,
  +showConsultationPlan: boolean,
  +dispatch: Dispatch,
  +consultationPlanEnabled: boolean,
  +isAuthenticated: boolean,
|};

let Stickyfill;

export const ConsultationPropositionBox = (props: Props) => {
  const {
    id,
    showConsultationPlan,
    consultationPlanEnabled,
    isAuthenticated,
    consultationSlug,
    dispatch,
  } = props;

  const [currentActiveItems, setCurrentActiveItems] = React.useState([]);

  const scrollSpy = () => {
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

    if (JSON.stringify(activeItems) !== JSON.stringify(currentActiveItems)) {
      dispatch(changeConsultationPlanActiveItems(activeItems));
    }

    setCurrentActiveItems(activeItems);
  };

  const animationFrame = () => {
    window.requestAnimationFrame(() => {
      scrollSpy();
    });
  };

  React.useEffect(() => {
    // eslint-disable-next-line
    Stickyfill = require('stickyfilljs');

    window.addEventListener('scroll', animationFrame, false);

    const elements = document.querySelectorAll('.sticky');
    Stickyfill.add(elements);
    return () => window.removeEventListener('scroll', animationFrame, false);
    // eslint-disable-next-line
  }, []);

  const renderSectionRecursiveList = ({
    error,
    props: queryProps,
  }: {
    ...ReactRelayReadyState,
    props: ?ConsultationPropositionBoxQueryResponse,
  }) => {
    if (error) {
      console.log(error); // eslint-disable-line no-console
      return graphqlError;
    }
    if (queryProps) {
      if (queryProps.consultationStep) {
        return (
          <>
            <ConsultationPropositionStep
              consultationPlanEnabled={consultationPlanEnabled}
              showConsultationPlan={showConsultationPlan}
              consultationStep={queryProps.consultationStep}
            />
          </>
        );
      }
      return graphqlError;
    }
    return <Loader />;
  };

  return (
    <div className="row">
      <QueryRenderer
        fetchPolicy="store-and-network"
        environment={environment}
        query={graphql`
          query ConsultationPropositionBoxQuery(
            $consultationStepId: ID!
            $consultationSlug: String!
            $isAuthenticated: Boolean!
          ) {
            consultationStep: node(id: $consultationStepId) {
              ... on ConsultationStep {
                state
                timeRange {
                  startAt
                }
              }
              ...ConsultationPropositionStep_consultationStep
                @arguments(consultationSlug: $consultationSlug, exceptStepId: $consultationStepId)
            }
          }
        `}
        variables={
          ({
            consultationStepId: id,
            consultationSlug,
            isAuthenticated,
          }: ConsultationPropositionBoxQueryVariables)
        }
        render={renderSectionRecursiveList}
      />
    </div>
  );
};

const mapStateToProps = (state: GlobalState, props: Props) => ({
  showConsultationPlan:
    props.id in state.project.showConsultationPlanById
      ? state.project.showConsultationPlanById[props.id]
      : true,
  consultationPlanEnabled: state.default.features.consultation_plan,
  isAuthenticated: !!state.user.user,
});

export default connect<any, any, _, _, _, _>(mapStateToProps)(ConsultationPropositionBox);
