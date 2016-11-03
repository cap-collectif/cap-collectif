import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { connect } from 'react-redux';
import { VOTE_TYPE_DISABLED, PROPOSAL_PAGINATION } from '../../constants/ProposalConstants';
import ProposalListFilters from '../Proposal/List/ProposalListFilters';
import ProposalList from '../Proposal/List/ProposalList';
import Loader from '../Utils/Loader';
import Pagination from '../Utils/Pagination';
import CollectStepPageHeader from './CollectStepPageHeader';
import ProposalRandomButton from '../Proposal/List/ProposalRandomButton';
import StepPageHeader from '../Steps/Page/StepPageHeader';
import VisibilityBox from '../Utils/VisibilityBox';
import { loadProposals, changePage } from '../../redux/modules/proposal';

export const ProposalStepPage = React.createClass({
  propTypes: {
    step: PropTypes.object.isRequired,
    count: PropTypes.number.isRequired,
    form: PropTypes.object.isRequired,
    statuses: PropTypes.array.isRequired,
    categories: PropTypes.array.isRequired,
    proposals: PropTypes.array.isRequired,
    currentPage: PropTypes.number.isRequired,
    randomOrder: PropTypes.bool.isRequired,
    isLoading: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
  },
  mixins: [IntlMixin],

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
      currentPage,
      dispatch,
      isLoading,
      randomOrder,
    } = this.props;
    const nbPages = Math.ceil(count / PROPOSAL_PAGINATION);
    const showPagination = nbPages > 1 && !randomOrder;
    const showRandomButton = nbPages > 1 && randomOrder;
    return (
      <div>
        <StepPageHeader step={step} />
        {
          step.type === 'collect' &&
            <CollectStepPageHeader
              count={count}
              form={form}
              categories={categories}
            />
        }
        <ProposalListFilters
          statuses={statuses}
          categories={categories}
          orderByVotes={step.voteType !== VOTE_TYPE_DISABLED}
          showThemes={form.usingThemes}
        />
        <br />
        <Loader show={isLoading}>
          <div>
            {
              proposals.length === 0 && !step.isPrivate
                ? <p className={{ 'p--centered': true }} style={{ marginBottom: '40px' }}>
                    { this.getIntlMessage('proposal.empty') }
                  </p>
                : <VisibilityBox enabled={step.isPrivate}>
                    <ProposalList
                      proposals={proposals}
                      step={step}
                      showThemes={form.usingThemes}
                    />
                  </VisibilityBox>
            }
            {
              showPagination &&
                <Pagination
                  current={currentPage}
                  nbPages={nbPages}
                  onChange={(newPage) => {
                    dispatch(changePage(newPage));
                    dispatch(loadProposals());
                  }}
                />
            }
            {
              showRandomButton && <ProposalRandomButton />
            }
          </div>
        </Loader>
      </div>
    );
  },

});

const mapStateToProps = (state, props) => {
  return {
    stepId: undefined,
    step: state.project.projects[state.project.currentProjectById].steps.filter(s => s.id === props.stepId)[0],
    proposals: Object.values(state.proposal.proposalsById),
    currentPage: state.proposal.currentPaginationPage,
    randomOrder: state.proposal.order === 'random',
    isLoading: state.proposal.isLoading,
  };
};
export default connect(mapStateToProps)(ProposalStepPage);
