// @flow
import * as React from 'react';
import { connect } from 'react-redux';
import { Row } from 'react-bootstrap';
import { QueryRenderer, graphql, type ReadyState } from 'react-relay';
import ProposalListFilters from '../Proposal/List/ProposalListFilters';
import UnpublishedProposalListView from '../Proposal/List/UnpublishedProposalListView';
import DraftProposalList from '../Proposal/List/DraftProposalList';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import ProposalStepPageHeader from './ProposalStepPageHeader';
import StepPageHeader from '../Steps/Page/StepPageHeader';
import LeafletMap from '../Proposal/Map/LeafletMap';
import environment, { graphqlError } from '../../createRelayEnvironment';
import ProposalListView, { queryVariables } from '../Proposal/List/ProposalListView';
import type { FeatureToggles, State } from '../../types';
import type {
  ProposalStepPageQueryResponse,
  ProposalStepPageQueryVariables,
} from '~relay/ProposalStepPageQuery.graphql';
import config from '../../config';

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
          render={({ error, props }: { props: ?ProposalStepPageQueryResponse } & ReadyState) => {
            if (error) {
              return graphqlError;
            }

            if (props) {
              const { step } = props;

              if (!step) {
                return graphqlError;
              }
              const { form } = step;
              if (!form) return;

              let geoJsons = [];
              if (features.display_map && form.districts) {
                try {
                  geoJsons = form.districts
                    .filter(d => d.geojson && d.displayedOnMap)
                    .map(d => ({
                      // $FlowFixMe geojson is string
                      district: JSON.parse(d.geojson),
                      style: {
                        border: d.border,
                        background: d.background,
                      },
                    }));
                } catch (e) {
                  // eslint-disable-next-line no-console
                  console.error("Can't parse your geojsons !", e);
                }
              }
              return (
                <div id="proposal__step-page-rendered">
                  {/* $FlowFixMe $refType */}
                  <StepPageHeader step={step} />
                  {isAuthenticated &&
                    // $FlowFixMe $refType
                    step.kind === 'collect' && <DraftProposalList step={step} />}
                  {isAuthenticated && (
                    // $FlowFixMe $refType
                    <UnpublishedProposalListView step={step} viewer={props.viewer} />
                  )}
                  {/* $FlowFixMe $refType */}
                  <ProposalStepPageHeader step={step} />
                  {/* $FlowFixMe please use mapDispatchToProps */}
                  <ProposalListFilters step={step} />
                  {step && !step.private && features.display_map ? (
                    /* $FlowFixMe please use mapDispatchToProps */
                    <LeafletMap
                      geoJsons={geoJsons}
                      defaultMapOptions={{
                        center: { lat: form.latMap ?? 48.8586047, lng: form.lngMap ?? 2.3137325 },
                        zoom: form.zoomMap ?? 10,
                      }}
                      visible={selectedViewByStep === 'map'}
                    />
                  ) : null}
                  {/* $FlowFixMe $refType */}
                  <ProposalListView
                    step={step}
                    count={count}
                    viewer={props.viewer || null}
                    view={selectedViewByStep === 'mosaic' ? 'mosaic' : 'table'}
                    visible={selectedViewByStep === 'mosaic' || selectedViewByStep === 'table'}
                  />
                </div>
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
