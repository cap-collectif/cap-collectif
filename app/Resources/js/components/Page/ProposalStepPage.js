// @flow
import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import { VOTE_TYPE_DISABLED, PROPOSAL_PAGINATION } from '../../constants/ProposalConstants';
import ProposalListFilters from '../Proposal/List/ProposalListFilters';
import ProposalListRandomRow from '../Proposal/List/ProposalListRandomRow';
import ProposalList from '../Proposal/List/ProposalList';
import Loader from '../Utils/Loader';
import Pagination from '../Utils/Pagination';
import CollectStepPageHeader from './CollectStepPageHeader';
import SelectionStepPageHeader from './SelectionStepPageHeader';
import StepPageHeader from '../Steps/Page/StepPageHeader';
import VisibilityBox from '../Utils/VisibilityBox';
import LeafletMap from '../Proposal/Map/LeafletMap';
import { loadProposals, changePage } from '../../redux/modules/proposal';

export const ProposalStepPage = React.createClass({
  propTypes: {
    step: PropTypes.object.isRequired,
    count: PropTypes.number.isRequired,
    queryCount: PropTypes.number,
    countFusions: PropTypes.number.isRequired,
    form: PropTypes.object.isRequired,
    statuses: PropTypes.array.isRequired,
    categories: PropTypes.array.isRequired,
    proposals: PropTypes.array.isRequired,
    currentPage: PropTypes.number.isRequired,
    randomOrder: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    selectedViewByStep: PropTypes.string.isRequired,
  },

  componentDidMount() {
    this.props.dispatch(loadProposals());
  },

  render() {
    const {
      proposals,
      categories,
      form,
      statuses,
      step,
      count,
      queryCount,
      countFusions,
      currentPage,
      dispatch,
      isLoading,
      randomOrder,
      selectedViewByStep,
    } = this.props;

    const total = queryCount || count;
    const nbPages = Math.ceil(total / PROPOSAL_PAGINATION);
    const showPagination = nbPages > 1 && !randomOrder;

    return (
      <div>
        <StepPageHeader step={step} />
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
          orderByVotes={step.voteType !== VOTE_TYPE_DISABLED}
          showThemes={form.usingThemes}
          showDistrictFilter={form.usingDistrict}
          showToggleMapButton={form.usingAddress && !step.isPrivate}
        />
        <br />
        <Loader show={isLoading}>
          <LeafletMap
            geoJsons={form.districts
              .filter(d => d.geojson !== null && d.displayedOnMap)
              .map(d => JSON.parse(d.geojson))}
            defaultMapOptions={{
              center: { lat: form.latMap, lng: form.lngMap },
              zoom: form.zoomMap,
            }}
            visible={selectedViewByStep === 'map' && !step.isPrivate}
          />
          {selectedViewByStep === 'mosaic' && (
            <div>
              {proposals.length === 0 && !step.isPrivate ? (
                <p className={{ 'p--centered': true }} style={{ marginBottom: '40px' }}>
                  {<FormattedMessage id="proposal.empty" />}
                </p>
              ) : (
                <VisibilityBox enabled={step.isPrivate}>
                  <ProposalList
                    proposals={proposals}
                    step={step}
                    showThemes={form.usingThemes}
                    id="proposals-list"
                  />
                </VisibilityBox>
              )}
              {showPagination &&
              selectedViewByStep === 'mosaic' && (
                <Pagination
                  current={currentPage}
                  nbPages={nbPages}
                  onChange={newPage => {
                    dispatch(changePage(newPage));
                    dispatch(loadProposals());
                  }}
                />
              )}
              {randomOrder &&
              proposals.length > 0 &&
              selectedViewByStep === 'mosaic' && (
                <ProposalListRandomRow orderByVotes={step.voteType !== VOTE_TYPE_DISABLED} />
              )}
            </div>
          )}
        </Loader>
      </div>
    );
  },
});

const mapStateToProps = (state, props) => ({
  stepId: undefined,
  step: state.project.projectsById[state.project.currentProjectById].stepsById[props.stepId],
  proposals: state.proposal.proposalShowedId.map(
    proposal => state.proposal.proposalsById[proposal],
  ),
  queryCount: state.proposal.queryCount,
  currentPage: state.proposal.currentPaginationPage,
  randomOrder: state.proposal.order === 'random',
  isLoading: state.proposal.isLoading,
  selectedViewByStep: state.proposal.selectedViewByStep || 'mosaic',
});
export default connect(mapStateToProps)(ProposalStepPage);
