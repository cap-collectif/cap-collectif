// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import { Row } from 'react-bootstrap';
import { QueryRenderer, graphql } from 'react-relay';
import { VOTE_TYPE_DISABLED } from '../../constants/ProposalConstants';
import ProposalListFilters from '../Proposal/List/ProposalListFilters';
import ProposalList from '../Proposal/List/ProposalList';
import DraftProposalList from '../Proposal/List/DraftProposalList';
import Loader from '../Ui/Loader';
import Pagination from '../Utils/Pagination';
import CollectStepPageHeader from './CollectStepPageHeader';
import SelectionStepPageHeader from './SelectionStepPageHeader';
import StepPageHeader from '../Steps/Page/StepPageHeader';
import VisibilityBox from '../Utils/VisibilityBox';
import LeafletMap from '../Proposal/Map/LeafletMap';
import environment, { graphqlError } from '../../createRelayEnvironment';
import { changePage } from '../../redux/modules/proposal';
import type { State, Dispatch } from '../../types';
import type { ProposalStepPageQueryResponse, ProposalStepPageQueryVariables } from './__generated__/ProposalStepPageQuery.graphql';

const PROPOSAL_PAGINATION = 51;

type Props = {
  step: Object,
  count: number,
  queryCount: ?number,
  countFusions: ?number,
  defaultSort: ?string,
  form: Object,
  statuses: Array<Object>,
  categories: Array<Object>,
  proposals: Array<Object>,
  currentPage: number,
  isLogged: boolean,
  isLoading: boolean,
  dispatch: Dispatch,
  selectedViewByStep: string,
};

export class ProposalStepPage extends React.Component<Props> {

  render() {
    const {
      categories,
      form,
      statuses,
      step,
      count,
      defaultSort,
      queryCount,
      countFusions,
      currentPage,
      dispatch,
      isLogged,
      selectedViewByStep,
    } = this.props;
    const total = queryCount || count;
    const nbPages = Math.ceil(total / PROPOSAL_PAGINATION);
    const showPagination = nbPages > 1;

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
        {isLogged && <DraftProposalList step={step} />}
        {step.type === 'collect' ? (
          <CollectStepPageHeader
            total={count}
            countFusions={countFusions}
            form={form}
            categories={categories}
          />
        ) : (
          <SelectionStepPageHeader total={count} />
        )}
        <ProposalListFilters
          statuses={statuses}
          categories={categories}
          districts={form.districts}
          defaultSort={defaultSort}
          orderByVotes={step.voteType !== VOTE_TYPE_DISABLED}
          orderByComments={form.commentable}
          orderByCost={form.costable}
          showThemes={form.usingThemes}
          showDistrictFilter={form.usingDistrict}
          showCategoriesFilter={form.usingCategories}
          showToggleMapButton={form.usingAddress && !step.isPrivate}
        />
        <QueryRenderer
          environment={environment}
          query={graphql`
            query ProposalStepPageQuery($stepId: ID!, $isAuthenticated: Boolean!) {
              viewer @include(if: $isAuthenticated) {
                ...ProposalList_viewer
              },
              step: node(id: $stepId) {
                ...ProposalList_step# @arguments(stepId: $stepId, isAuthenticated: $isAuthenticated)
                ... on CollectStep {
                  id
                  private
                  form {
                    proposals {
                      edges {
                        node {
                          id
                        }
                      }
                    }
                  }
                }
                ... on SelectionStep {
                  id
                  private
                  proposals {
                    edges {
                      node {
                        id
                      }
                    }
                  }
                }
              }
            }
          `}
          variables={({
            stepId: this.props.step.id,
            isAuthenticated: this.props.isLogged,
            count: PROPOSAL_PAGINATION,
            // const filters = {};
            // if (state.filters) {
            //   Object.keys(state.filters).forEach(key => {
            //     if (state.filters[key] && state.filters[key] !== '0') {
            //       filters[key] = state.filters[key];
            //     }
            //   });
            // }
            //
            // const order = state.order ? state.order : PROPOSAL_ORDER_RANDOM;
            // url += `?page=${state.currentPaginationPage}&pagination=${PROPOSAL_PAGINATION}&order=${order}`;
            // body = { terms: state.terms, filters };
          }: ProposalStepPageQueryVariables)}
          render={({
            error,
            props,
          }: {
            error: ?Error,
            props: ?ProposalStepPageQueryResponse,
          }) => {
            if (error) {
              return graphqlError;
            }

            if (props) {
              // eslint-disable-next-line react/prop-types
              if (!props.step) {
                return null;
              }
              const proposals = props.step.proposals || props.step.form.proposals;
              return (
                <div>
                  <LeafletMap
                    geoJsons={geoJsons}
                    defaultMapOptions={{
                      center: { lat: form.latMap, lng: form.lngMap },
                      zoom: form.zoomMap,
                    }}
                    visible={selectedViewByStep === 'map' && !props.step.private}
                  />
                  {selectedViewByStep === 'mosaic' && (
                    <div>
                      {proposals.edges.length === 0 && !props.step.private ? (
                        <p className={{ 'p--centered': true }} style={{ marginBottom: '40px' }}>
                          <FormattedMessage id="proposal.empty" />
                        </p>
                      ) : (
                        <VisibilityBox enabled={props.step.private}>
                          <ProposalList
                            step={props.step}
                            showThemes={form.usingThemes}
                            showComments={form.commentable}
                            id="proposals-list"
                          />
                        </VisibilityBox>
                      )}
                      <div id="proposal-list-pagination-footer">
                        {showPagination &&
                          selectedViewByStep === 'mosaic' && (
                            <Pagination
                              current={currentPage}
                              nbPages={nbPages}
                              onChange={(newPage: number) => {
                                dispatch(changePage(newPage));
                              }}
                            />
                          )}
                      </div>
                    </div>
                  )}
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
};

const mapStateToProps: MapStateToProps<*, *, *> = (state: State, props: Object) => ({
  stepId: undefined,
  isLogged: state.user.user !== null,
  step:
    state.project.currentProjectById &&
    state.project.projectsById[state.project.currentProjectById].stepsById[props.stepId],
  queryCount: state.proposal.queryCount,
  currentPage: state.proposal.currentPaginationPage,
  isLoading: state.proposal.isLoading,
  selectedViewByStep: state.proposal.selectedViewByStep || 'mosaic',
});
export default connect(mapStateToProps)(ProposalStepPage);
