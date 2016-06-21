import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';

import ProposalStore from '../../stores/ProposalStore';
import ProposalActions from '../../actions/ProposalActions';
import { PROPOSAL_PAGINATION } from '../../constants/ProposalConstants';
import ProposalListFilters from '../Proposal/List/ProposalListFilters';
import ProposalList from '../Proposal/List/ProposalList';
import Loader from '../Utils/Loader';
import Pagination from '../Utils/Pagination';
import CollectStepPageHeader from './CollectStepPageHeader';
import ProposalRandomButton from '../Proposal/List/ProposalRandomButton';
import StepPageHeader from '../Steps/Page/StepPageHeader';

const CollectStepPage = React.createClass({
  propTypes: {
    step: PropTypes.object.isRequired,
    count: PropTypes.number.isRequired,
    form: PropTypes.object.isRequired,
    themes: PropTypes.array.isRequired,
    statuses: PropTypes.array.isRequired,
    districts: PropTypes.array.isRequired,
    types: PropTypes.array.isRequired,
    categories: PropTypes.array.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      proposals: ProposalStore.proposals,
      proposalsCount: this.props.count,
      currentPage: ProposalStore.currentPage,
      isLoading: true,
      randomOrder: ProposalStore.order === 'random',
    };
  },

  componentWillMount() {
    ProposalStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    this.loadProposals();
  },

  componentDidUpdate(prevProps, prevState) {
    if (prevState && (prevState.currentPage !== this.state.currentPage)) {
      this.loadProposals();
    }
  },

  componentWillUnmount() {
    ProposalStore.removeChangeListener(this.onChange);
  },

  onChange() {
    if (!ProposalStore.isProcessing && ProposalStore.isProposalListSync) {
      this.setState({
        proposals: ProposalStore.proposals,
        proposalsCount: ProposalStore.proposalsCount,
        currentPage: ProposalStore.currentPage,
        isLoading: false,
        randomOrder: ProposalStore.order === 'random',
      });
      return;
    }

    this.loadProposals();
  },

  loadProposals() {
    this.setState({
      isLoading: true,
    });
    ProposalActions.load('form', this.props.form.id);
  },

  handleFilterOrOrderChange() {
    this.setState({ isLoading: true });
  },

  selectPage(newPage) {
    this.setState({ isLoading: true });
    ProposalActions.changePage(newPage);
  },

  render() {
    const nbPages = Math.ceil(this.state.proposalsCount / PROPOSAL_PAGINATION);
    const showPagination = nbPages > 1 && !this.state.randomOrder;
    const showRandomButton = nbPages > 1 && this.state.randomOrder;
    return (
      <div>
        <StepPageHeader step={this.props.step} />
        <CollectStepPageHeader
          count={this.state.proposalsCount}
          form={this.props.form}
          themes={this.props.themes}
          districts={this.props.districts}
          categories={this.props.categories}
        />
        <ProposalListFilters
          id={this.props.form.id}
          themes={this.props.themes}
          districts={this.props.districts}
          types={this.props.types}
          statuses={this.props.statuses}
          categories={this.props.categories}
          onChange={() => this.handleFilterOrOrderChange()}
          showThemes={this.props.form.usingThemes}
        />
        <br />
        <Loader show={this.state.isLoading}>
          <div>
            <ProposalList proposals={this.state.proposals} showThemes={this.props.form.usingThemes} />
            {
              showPagination
              ? <Pagination
                  current={this.state.currentPage}
                  nbPages={nbPages}
                  onChange={this.selectPage}
              />
              : null
            }
            {
              showRandomButton
              ? <ProposalRandomButton isLoading={this.state.isLoading} onClick={this.loadProposals} />
              : null
            }
          </div>
        </Loader>
      </div>
    );
  },

});

export default CollectStepPage;
