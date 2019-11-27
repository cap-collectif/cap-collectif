import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ElementsList from './List/ElementsList';
import Loader from '../Ui/FeedbacksIndicators/Loader';
import SynthesisElementStore from '../../stores/SynthesisElementStore';
import SynthesisElementActions from '../../actions/SynthesisElementActions';

const Pagination = 15;

class ElementsSearch extends React.Component {
  static propTypes = {
    synthesis: PropTypes.object.isRequired,
    params: PropTypes.object,
  };

  static defaultProps = {
    params: { term: '' },
  };

  state = {
    elements: [],
    count: 0,
    isLoading: true,
    isLoadingMore: false,
    offset: 0,
    limit: Pagination,
  };

  componentWillMount() {
    SynthesisElementStore.addChangeListener(this.onChange);
  }

  componentDidMount() {
    this.onChange();
  }

  componentWillReceiveProps(nextProps) {
    const { params } = this.props;
    if (nextProps.params.term !== params.term) {
      this.setState(
        {
          isLoading: true,
          limit: Pagination,
        },
        () => {
          this.loadElementsByTermFromServer(nextProps.params.term).then(() => {
            this.resetLoadMoreButton();
          });
        },
      );
    }
  }

  componentWillUnmount() {
    SynthesisElementStore.removeChangeListener(this.onChange);
  }

  onChange = () => {
    this.setState({
      elements: SynthesisElementStore.elements.search,
      count: SynthesisElementStore.counts.search,
      isLoading: false,
      isLoadingMore: false,
    });
  };

  resetLoadMoreButton = () => {
    const loadMoreButton = ReactDOM.findDOMNode(this.refs.loadMore);
    if (loadMoreButton) {
      $(loadMoreButton).button('reset');
    }
  };

  loadElementsByTermFromServer = (term = this.props.params.term) => {
    const { synthesis } = this.props;
    SynthesisElementActions.loadElementsByTermFromServer(
      synthesis.id,
      term,
      this.state.offset,
      this.state.limit,
    );
  };

  loadMore = () => {
    $(ReactDOM.findDOMNode(this.refs.loadMore)).button('loading');
    this.setState(
      {
        isLoadingMore: true,
        limit: this.state.limit + Pagination,
      },
      () => {
        this.loadElementsByTermFromServer();
      },
    );
  };

  renderList = () => {
    if (!this.state.isLoading) {
      if (this.state.elements.length > 0) {
        return <ElementsList elements={this.state.elements} />;
      }
      return (
        <div className="synthesis__list--empty  text-center">
          <p className="icon  cap-bubble-attention-6" />
          <p>{<FormattedMessage id="synthesis.edition.list.none" />}</p>
        </div>
      );
    }
  };

  renderLoadMore = () => {
    if (
      !this.state.isLoading &&
      (this.state.limit < this.state.count || this.state.isLoadingMore)
    ) {
      return (
        <button
          className="btn btn-block btn-dark-grey"
          ref="loadMore"
          data-loading-text={<FormattedMessage id="synthesis.common.loading" />}
          onClick={this.loadMore.bind(this)}>
          {<FormattedMessage id='global.more' />}
        </button>
      );
    }
  };

  render() {
    return (
      <div className="synthesis__inbox">
        <Loader show={this.state.isLoading} />
        {this.renderList()}
        {this.renderLoadMore()}
      </div>
    );
  }
}

export default ElementsSearch;
