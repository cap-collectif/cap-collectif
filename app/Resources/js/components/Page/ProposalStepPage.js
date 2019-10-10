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
import StepPageHeader from '../Steps/Page/StepPageHeader';
import environment, { graphqlError } from '../../createRelayEnvironment';
import ProposalListView, { queryVariables } from '../Proposal/List/ProposalListView';
import type { FeatureToggles, State } from '../../types';
import type {
  ProposalStepPageQueryResponse,
  ProposalStepPageQueryVariables,
} from '~relay/ProposalStepPageQuery.graphql';
import config from '../../config';
import warning from '../../utils/warning';

type OwnProps = {|
  stepId: string,
  count: number,
|};

type Props = {|
  ...OwnProps,
  filters: Object,
  order: ?string,
  terms: ?string,
  isAuthenticated: boolean,
  selectedViewByStep: string,
  features: FeatureToggles,
|};

type RenderedProps = {|
  ...ProposalStepPageQueryResponse,
  selectedViewByStep: string,
  count: number,
  isAuthenticated: boolean,
  features: FeatureToggles,
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
  const { viewer, isAuthenticated, features, step, selectedViewByStep, count } = props;

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
      <ProposalListFilters step={step} />
      <ProposalListView
        displayMap={features.display_map}
        geoJsons={geoJsons}
        step={step}
        count={count}
        viewer={viewer || null}
        defaultMapOptions={{
          center: { lat: form.latMap ?? 48.8586047, lng: form.lngMap ?? 2.3137325 },
          zoom: form.zoomMap ?? 10,
        }}
        view={selectedViewByStep}
      />
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
    const { count, stepId, isAuthenticated, selectedViewByStep, features } = this.props;

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
                    latMap
                    lngMap
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
                    ...DraftProposalList_step @arguments(isAuthenticated: $isAuthenticated)
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
                  selectedViewByStep={selectedViewByStep}
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
  selectedViewByStep: state.proposal.selectedViewByStep || 'mosaic',
  features: state.default.features,
});

export default connect<Props, State, _>(mapStateToProps)(ProposalStepPage);
