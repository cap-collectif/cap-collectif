// @flow
import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import { connect, type MapStateToProps } from 'react-redux';
import { Row } from 'react-bootstrap';
import { QueryRenderer, graphql } from 'react-relay';
import { VOTE_TYPE_DISABLED, PROPOSAL_PAGINATION } from '../../constants/ProposalConstants';
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
// import { loadProposals, changePage } from '../../redux/modules/proposal';
import type { State, Dispatch } from '../../types';
import type { ProposalStepPageQueryResponse, ProposalStepPageQueryVariables } from './__generated__/ProposalStepPageQuery.graphql';

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
      // dispatch,
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
            query ProposalStepPageQuery($id: ID!) {
              step: node(id: $id) {
                ... on CollectStep {
                  id
                  private
                }
                ... on SelectionStep {
                  id
                  private
                }
              }
            }
          `}
          variables={({
            id: this.props.step.id,
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

              return (
                <div>
                  <LeafletMap
                    geoJsons={geoJsons}
                    defaultMapOptions={{
                      center: { lat: form.latMap, lng: form.lngMap },
                      zoom: form.zoomMap,
                    }}
                    visible={selectedViewByStep === 'map' && !step.private}
                  />
                  {selectedViewByStep === 'mosaic' && (
                    <div>
                      {step.proposals.edges.length === 0 && !step.private ? (
                        <p className={{ 'p--centered': true }} style={{ marginBottom: '40px' }}>
                          <FormattedMessage id="proposal.empty" />
                        </p>
                      ) : (
                        <VisibilityBox enabled={step.private}>
                          <ProposalList
                            step={step}
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
                                // dispatch(changePage(newPage));
                                // dispatch(loadProposals());
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
