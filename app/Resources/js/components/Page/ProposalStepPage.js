// @flow
import * as React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
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
} from './__generated__/ProposalStepPageQuery.graphql';
import config from '../../config';

type Props = {
  step: Object,
  defaultSort: ?string,
  form: Object,
  filters: Object,
  order: ?string,
  terms: ?string,
  statuses: Array<Object>,
  categories: Array<Object>,
  isAuthenticated: boolean,
  selectedViewByStep: string,
  features: FeatureToggles,
};

export class ProposalStepPage extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    // $FlowFixMe
    this.initialRenderVars = {
      term: props.terms,
      ...queryVariables(props.filters, props.order),
    };
  }

  render() {
    const {
      categories,
      form,
      statuses,
      step,
      defaultSort,
      isAuthenticated,
      selectedViewByStep,
      features,
    } = this.props;

    let geoJsons = [];
    try {
      geoJsons = form.districts
        .filter(d => d.geojson && d.displayedOnMap)
        .map(d => ({
          district: JSON.parse(d.geojson),
          style: {
            border: d.border,
            background: d.background,
          },
          styleLegacy: d.geojsonStyle,
        }));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Can't parse your geojsons !", e);
    }

    return (
      <div className="proposal__step-page">
        <StepPageHeader step={step} />
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
            ) {
              viewer @include(if: $isAuthenticated) {
                ...ProposalListView_viewer
                ...UnpublishedProposalListView_viewer
              }
              step: node(id: $stepId) {
                id
                ...ProposalListView_step @arguments(count: $count)
                ...UnpublishedProposalListView_step @arguments(isAuthenticated: $isAuthenticated)
                ...ProposalStepPageHeader_step
                ... on Step {
                  kind
                }
                ... on CollectStep {
                  private
                  ...DraftProposalList_step @arguments(isAuthenticated: $isAuthenticated)
                }
                ... on ProposalStep {
                  voteType
                }
              }
            }
          `}
          variables={
            // $FlowFixMe
            ({
              stepId: this.props.step.id,
              isAuthenticated: this.props.isAuthenticated,
              count: config.isMobile ? 25 : 50,
              cursor: null,
              // $FlowFixMe
              ...this.initialRenderVars,
            }: ProposalStepPageQueryVariables)
          }
          render={({ error, props }: { props: ?ProposalStepPageQueryResponse } & ReadyState) => {
            if (error) {
              return graphqlError;
            }

            if (props) {
              if (!props.step) {
                return graphqlError;
              }
              return (
                <div id="proposal__step-page-rendered">
                  {isAuthenticated &&
                    // $FlowFixMe
                    props.step.kind === 'collect' && <DraftProposalList step={props.step} />}
                  {isAuthenticated && (
                    // $FlowFixMe
                    <UnpublishedProposalListView step={props.step} viewer={props.viewer} />
                  )}
                  {/* $FlowFixMe */}
                  <ProposalStepPageHeader step={props.step} />
                  <ProposalListFilters
                    statuses={statuses}
                    categories={categories}
                    districts={form.districts}
                    defaultSort={defaultSort}
                    orderByVotes={props.step.voteType !== 'DISABLED'}
                    orderByComments={form.commentable}
                    orderByCost={form.costable}
                    showThemes={form.usingThemes}
                    showDistrictFilter={form.usingDistrict}
                    showCategoriesFilter={form.usingCategories}
                    showMapButton={form.usingAddress && !props.step.private && features.display_map}
                  />
                  {features.display_map ? (
                    <LeafletMap
                      geoJsons={geoJsons}
                      defaultMapOptions={{
                        center: { lat: form.latMap, lng: form.lngMap },
                        zoom: form.zoomMap,
                      }}
                      visible={selectedViewByStep === 'map' && !props.step.private}
                    />
                  ) : null}
                  {/* $FlowFixMe */}
                  <ProposalListView
                    step={props.step}
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

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: Object) => ({
  stepId: undefined,
  isAuthenticated: state.user.user !== null,
  filters: state.proposal.filters || {},
  terms: state.proposal.terms,
  order: state.proposal.order,
  step:
    state.project.currentProjectById &&
    state.project.projectsById[state.project.currentProjectById].stepsById[props.stepId],
  selectedViewByStep: state.proposal.selectedViewByStep || 'mosaic',
  features: state.default.features,
});
export default connect(mapStateToProps)(ProposalStepPage);
