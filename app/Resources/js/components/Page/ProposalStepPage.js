// @flow
import * as React from 'react';
import { connect, type MapStateToProps } from 'react-redux';
import { Row } from 'react-bootstrap';
import { QueryRenderer, graphql } from 'react-relay';
import ProposalListFilters from '../Proposal/List/ProposalListFilters';
import DraftProposalList from '../Proposal/List/DraftProposalList';
import Loader from '../Ui/Loader';
import ProposalStepPageHeader from './ProposalStepPageHeader';
import StepPageHeader from '../Steps/Page/StepPageHeader';
import LeafletMap from '../Proposal/Map/LeafletMap';
import environment, { graphqlError } from '../../createRelayEnvironment';
import ProposalListView, { queryVariables } from '../Proposal/List/ProposalListView';
import type { State, Dispatch } from '../../types';
import type {
  ProposalStepPageQueryResponse,
  ProposalStepPageQueryVariables,
} from './__generated__/ProposalStepPageQuery.graphql';

type Props = {
  step: Object,
  defaultSort: ?string,
  form: Object,
  filters: Object,
  order: ?string,
  terms: ?string,
  statuses: Array<Object>,
  categories: Array<Object>,
  currentPage: number,
  isAuthenticated: boolean,
  dispatch: Dispatch,
  selectedViewByStep: string,
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
    } = this.props;

    let geoJsons = [];
    try {
      geoJsons = form.districts.filter(d => d.geojson && d.displayedOnMap).map(d => {
        return { district: JSON.parse(d.geojson), style: d.geojsonStyle };
      });
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
              }
              step: node(id: $stepId) {
                id
                ...ProposalListView_step @arguments(count: $count)
                ...ProposalStepPageHeader_step
                ... on CollectStep {
                  private
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
              count: 50,
              // $FlowFixMe
              ...this.initialRenderVars,
            }: ProposalStepPageQueryVariables)
          }
          render={({ error, props }: { error: ?Error, props: ?ProposalStepPageQueryResponse }) => {
            if (error) {
              return graphqlError;
            }

            if (props) {
              if (!props.step) {
                return graphqlError;
              }
              return (
                <div>
                  {/* $FlowFixMe */}
                  {isAuthenticated && <DraftProposalList step={props.step} />}
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
                    showToggleMapButton={form.usingAddress && !props.step.private}
                  />
                  <LeafletMap
                    geoJsons={geoJsons}
                    defaultMapOptions={{
                      center: { lat: form.latMap, lng: form.lngMap },
                      zoom: form.zoomMap,
                    }}
                    visible={selectedViewByStep === 'map' && !props.step.private}
                  />
                  {/* $FlowFixMe */}
                  <ProposalListView
                    step={props.step}
                    viewer={props.viewer || null}
                    visible={selectedViewByStep === 'mosaic'}
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
  currentPage: state.proposal.currentPaginationPage,
  selectedViewByStep: state.proposal.selectedViewByStep || 'mosaic',
});
export default connect(mapStateToProps)(ProposalStepPage);
