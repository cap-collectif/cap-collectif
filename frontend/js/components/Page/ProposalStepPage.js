// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { Row } from 'react-bootstrap';
import { QueryRenderer, graphql } from 'react-relay';
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
import warning from '../../utils/warning';
import LoginModal from '~/components/User/Login/LoginModal';

type OwnProps = {|
  stepId: string,
  count: number,
|};

type StateProps = {|
  filters: Object,
  order: ?string,
  terms: ?string,
  isAuthenticated: boolean,
  isTipsMeeeEnabled: boolean,
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
  isTipsMeeeEnabled: boolean,
|};

const parseGeoJson = (district: { +geojson: string, +id: string }) => {
  const { geojson, id } = district;
  try {
    return JSON.parse(geojson);
  } catch (e) {
    warning(
      false,
      `Using empty geojson for ${id} because we couldn't parse the geojson : ${geojson}`,
    );
    return null;
  }
};

export const ProposalStepPageRendered = (props: RenderedProps) => {
  const { isTipsMeeeEnabled, viewer, isAuthenticated, features, step, count } = props;
  const [displayMode, setDisplayMode] = React.useState(step?.mainView);

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
    geoJsons = form.districts
      .filter(d => d.geojson && d.displayedOnMap)
      .map(d => ({
        // $FlowFixMe geojson is a non-null string, don't worry Flow
        district: parseGeoJson(d),
        style: {
          border: d.border,
          background: d.background,
        },
      }));
  }
  return (
    <div id="ProposalStepPage-rendered">
      <StepPageHeader step={step} />
      {isAuthenticated && step.kind === 'collect' && <DraftProposalList step={step} />}
      {isAuthenticated && (
        // $FlowFixMe
        <UnpublishedProposalListView step={step} viewer={viewer} />
      )}
      <ProposalStepPageHeader step={step} />
      <ProposalListFilters step={step} setDisplayMode={setDisplayMode} displayMode={displayMode} />
      <ProposalListView
        displayMap={features.display_map}
        isTipsMeeeEnabled={isTipsMeeeEnabled}
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
    const { count, stepId, isAuthenticated, features, isTipsMeeeEnabled } = this.props;

    return (
      <div className="proposal__step-page">
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ProposalStepPageQuery(
              $stepId: ID!
              $cursor: String
              $orderBy: ProposalOrder
              $isAuthenticated: Boolean!
              $isTipsMeeeEnabled: Boolean!
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
                ...ProposalListView_viewer
                ...UnpublishedProposalListView_viewer
              }
              step: node(id: $stepId) {
                ... on ProposalStep {
                  id
                  defaultSort
                  voteType
                  statuses {
                    id
                    name
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
              isTipsMeeeEnabled,
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
                  isTipsMeeeEnabled={isTipsMeeeEnabled}
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
  isTipsMeeeEnabled: !!state.default.features.unstable__tipsmeee,
});

export default connect<Props, OwnProps, _, _, _, _>(mapStateToProps)(ProposalStepPage);
