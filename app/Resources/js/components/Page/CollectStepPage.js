import React from 'react';
import {IntlMixin} from 'react-intl';

import ProposalStore from '../../stores/ProposalStore';
import ProposalActions from '../../actions/ProposalActions';
import {PROPOSAL_PAGINATION} from '../../constants/ProposalConstants';
import ProposalListFilters from '../Proposal/List/ProposalListFilters';
import ProposalList from '../Proposal/List/ProposalList';
import Loader from '../Utils/Loader';
import Pagination from '../Utils/Pagination';
import CollectStepPageHeader from './CollectStepPageHeader';
import FlashMessages from '../Utils/FlashMessages';

const CollectStepPage = React.createClass({
  propTypes: {
    count: React.PropTypes.number.isRequired,
    form: React.PropTypes.object.isRequired,
    themes: React.PropTypes.array.isRequired,
    statuses: React.PropTypes.array.isRequired,
    districts: React.PropTypes.array.isRequired,
    types: React.PropTypes.array.isRequired,
  },
  mixins: [IntlMixin],

  getInitialState() {
    return {
      proposals: ProposalStore.proposals,
      proposalsCount: this.props.count,
      currentPage: ProposalStore.currentPage,
      isLoading: true,
      messages: {
        'errors': [],
        'success': [],
      },
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
        messages: ProposalStore.messages,
        proposals: ProposalStore.proposals,
        proposalsCount: ProposalStore.proposalsCount,
        currentPage: ProposalStore.currentPage,
        isLoading: false,
      });
      return;
    }

    this.loadProposals();
  },

  loadProposals() {
    ProposalActions.load('form', this.props.form.id);
  },

  handleFilterOrOrderChange() {
    this.setState({isLoading: true});
  },

  selectPage(newPage) {
    this.setState({isLoading: true});
    ProposalActions.changePage(newPage);
  },

  render() {
    const nbPages = Math.ceil(this.state.proposalsCount / PROPOSAL_PAGINATION);
    return (
      <div>
        <FlashMessages errors={this.state.messages.errors} success={this.state.messages.success} />
        <CollectStepPageHeader
          count={this.state.proposalsCount}
          form={this.props.form}
          themes={this.props.themes}
          districts={this.props.districts}
        />
        <ProposalListFilters
          id={this.props.form.id}
          theme={this.props.themes}
          district={this.props.districts}
          type={this.props.types}
          status={this.props.statuses}
          onChange={() => this.handleFilterOrOrderChange()}
        />
        <br />
        <Loader show={this.state.isLoading}>
          <div>
            <ProposalList proposals={this.state.proposals} />
            {
              nbPages > 1
              ? <Pagination
                  current={this.state.currentPage}
                  nbPages={nbPages}
                  onChange={this.selectPage}
              />
              : null
            }
          </div>
        </Loader>
      </div>
    );
  },

});

export default CollectStepPage;
