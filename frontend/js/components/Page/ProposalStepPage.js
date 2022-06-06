// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { Row } from 'react-bootstrap';
import { QueryRenderer, graphql } from 'react-relay';
import { useIntl } from 'react-intl';
import ProposalListFilters from '../Proposal/List/ProposalListFilters';
import UnpublishedProposalListView from '../Proposal/List/UnpublishedProposalListView';
import DraftProposalList from '../Proposal/List/DraftProposalList';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import ProposalStepPageHeader from './ProposalStepPageHeader';
import StepPageHeader from '../Steps/Page/StepPageHeader/StepPageHeader';
import environment, { graphqlError } from '../../createRelayEnvironment';
import ProposalListView, { queryVariables } from '../Proposal/List/ProposalListView';
import type { Dispatch, FeatureToggles, State } from '../../types';
import type {
  ProposalStepPageQueryResponse,
  ProposalStepPageQueryVariables,
} from '~relay/ProposalStepPageQuery.graphql';
import config from '../../config';
import LoginModal from '~/components/User/Login/LoginModal';
import { formatGeoJsons } from '~/utils/geojson';
import useFeatureFlag from '~/utils/hooks/useFeatureFlag';
import StepEvents from '../Steps/StepEvents';

type OwnProps = {|
  stepId: string,
  projectId: string,
  count: number,
|};

type StateProps = {|
  filters: Object,
  order: ?string,
  terms: ?string,
  isAuthenticated: boolean,
  features: FeatureToggles,
  dispatch: Dispatch,
|};

type Props = {|
  ...OwnProps,
  ...StateProps,
|};

type RenderedProps = {|
  ...ProposalStepPageQueryResponse,
  count: number,
  isAuthenticated: boolean,
  features: FeatureToggles,
|};

export const ProposalStepPageRendered = (props: RenderedProps) => {
  const { viewer, isAuthenticated, features, step, count } = props;
  const [displayMode, setDisplayMode] = React.useState(step?.mainView);
  const intl = useIntl();
  const calendar = useFeatureFlag('calendar');

  React.useEffect(() => {
    if (!displayMode && step?.mainView) setDisplayMode(step?.mainView);
  }, [displayMode, setDisplayMode, step]);

  if (!step) {
    return graphqlError;
  }
  const { form } = step;
  if (!form) return null;

  let geoJsons = [];
  if (features.display_map && form.districts) {
    geoJsons = formatGeoJsons(form.districts);
  }
  return (
    <div id="ProposalStepPage-rendered">
      {step.events?.totalCount && calendar ? <StepEvents step={step} /> : null}
      {step.state === 'CLOSED' ? ( // We keep for now these "old style" alerts
        <div className="alert alert-info alert-dismissible block" role="alert">
          <p>
            <strong>{intl.formatMessage({ id: 'step.selection.alert.ended.title' })}</strong>{' '}
            {intl.formatMessage({ id: 'thank.for.contribution' })}
          </p>
        </div>
      ) : null}
      {step.state === 'FUTURE' ? (
        <div className="alert alert-info alert-dismissible block" role="alert">
          <p>
            <strong>{intl.formatMessage({ id: 'step.collect.alert.future.title' })}</strong>{' '}
            {intl.formatMessage(
              {
                id: 'step.start.future',
              },
              {
                date: intl.formatDate(step.timeRange?.startAt),
              },
            )}
          </p>
        </div>
      ) : null}
      <StepPageHeader step={step} />
      {isAuthenticated && step.kind === 'collect' && <DraftProposalList step={step} />}
      {isAuthenticated && (
        // $FlowFixMe
        <UnpublishedProposalListView step={step} viewer={viewer} />
      )}
      {/**  $FlowFixMe Bug Day Enum : #13394 */}
      <ProposalStepPageHeader step={step} displayMode={displayMode} />
      <ProposalListFilters step={step} setDisplayMode={setDisplayMode} displayMode={displayMode} />
      <ProposalListView
        displayMap={features.display_map}
        geoJsons={geoJsons}
        step={step}
        count={count}
        displayMode={displayMode}
        viewer={viewer || null}
        defaultMapOptions={{
          center: { lat: form.mapCenter?.lat || 48.8586047, lng: form.mapCenter?.lng || 2.3137325 },
          zoom: form.zoomMap || 10,
        }}
      />
      <LoginModal />
    </div>
  );
};

export class ProposalStepPage extends React.Component<Props> {
  initialRenderVars: Object;

  constructor(props: Props) {
    super(props);
    this.initialRenderVars = {
      term: props.terms,
      ...queryVariables(props.filters, props.order),
    };
  }

  render() {
    const { count, stepId, isAuthenticated, features } = this.props;
    return (
      <div className="proposal__step-page">
        <QueryRenderer
          fetchPolicy="store-and-network"
          environment={environment}
          query={graphql`
            query ProposalStepPageQuery(
              $stepId: ID!
              $cursor: String
              $orderBy: ProposalOrder
              $isAuthenticated: Boolean!
              $count: Int
              $term: String
              $district: ID
              $category: ID
              $status: ID
              $theme: ID
              $userType: ID
              $isMapDisplay: Boolean!
            ) {
              viewer @include(if: $isAuthenticated) {
                ...ProposalListView_viewer @arguments(stepId: $stepId)
                ...UnpublishedProposalListView_viewer @arguments(stepId: $stepId)
              }
              step: node(id: $stepId) {
                ... on ProposalStep {
                  id
                  events(orderBy: { field: START_AT, direction: DESC }) {
                    totalCount
                  }
                  defaultSort
                  voteType
                  state
                  statuses {
                    id
                    name
                  }
                  timeRange {
                    startAt
                  }
                  form {
                    mapCenter {
                      lat
                      lng
                    }
                    zoomMap
                    districts(order: ALPHABETICAL) @include(if: $isMapDisplay) {
                      displayedOnMap
                      geojson
                      id
                      border {
                        id
                        enabled
                        color
                        opacity
                        size
                      }
                      background {
                        id
                        enabled
                        color
                        opacity
                        size
                      }
                    }
                  }
                  kind
                  ...ProposalsDisplayMap_step
                  ...StepPageHeader_step
                  ...ProposalListFilters_step
                  ...ProposalListView_step @arguments(count: $count)
                  ...UnpublishedProposalListView_step @arguments(isAuthenticated: $isAuthenticated)
                  ...ProposalStepPageHeader_step
                  ...StepEvents_step
                  ... on CollectStep {
                    private
                    mainView
                    ...DraftProposalList_step @arguments(isAuthenticated: $isAuthenticated)
                  }
                  ... on SelectionStep {
                    mainView
                  }
                }
              }
            }
          `}
          variables={
            ({
              stepId,
              isAuthenticated,
              count: config.isMobile ? 10 : count,
              cursor: null,
              ...this.initialRenderVars,
              isMapDisplay: features.display_map,
            }: ProposalStepPageQueryVariables)
          }
          render={({
            error,
            props,
          }: {
            ...ReactRelayReadyState,
            props: ?ProposalStepPageQueryResponse,
          }) => {
            if (error) {
              return graphqlError;
            }

            if (props) {
              return (
                <ProposalStepPageRendered
                  {...props}
                  count={count}
                  isAuthenticated={isAuthenticated}
                  features={features}
                />
              );
            }
            return (
              <Row>
                <Loader />
              </Row>
            );
          }}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: State) => ({
  isAuthenticated: state.user.user !== null,
  filters: state.proposal.filters || {},
  terms: state.proposal.terms,
  order: state.proposal.order,
  features: state.default.features,
});

export default connect<Props, OwnProps, _, _, _, _>(mapStateToProps)(ProposalStepPage);
