import React from 'react';
import ReactDOM from 'react-dom';
import { FormattedMessage } from 'react-intl';
import ElementsList from './../List/ElementsList';
import Loader from '../../Utils/Loader';
import SynthesisElementStore from '../../../stores/SynthesisElementStore';
import SynthesisElementActions from '../../../actions/SynthesisElementActions';

const Pagination = 15;

const ElementsInbox = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
    params: React.PropTypes.object,
    searchTerm: React.PropTypes.string,
  },

  getDefaultProps() {
    return {
      params: { type: 'new' },
      searchTerm: '',
    };
  },

  getInitialState() {
    return {
      elements: [],
      count: 0,
      isLoading: true,
      isLoadingMore: false,
      offset: 0,
      limit: Pagination,
    };
  },

  componentWillMount() {
    SynthesisElementStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    this.loadElementsByTypeFromServer();
  },

  componentWillReceiveProps(nextProps) {
    const { params } = this.props;
    if (nextProps.params.type !== params.type) {
      this.setState(
        {
          isLoading: true,
          limit: Pagination,
        },
        () => {
          this.loadElementsByTypeFromServer(nextProps.params.type);
        },
      );
    }
  },

  componentWillUnmount() {
    SynthesisElementStore.removeChangeListener(this.onChange);
  },

  onChange() {
    const { params } = this.props;
    this.setState({
      elements: SynthesisElementStore.elements[params.type],
      count: SynthesisElementStore.counts[params.type],
      isLoading: false,
      isLoadingMore: false,
    });
  },

  resetLoadMoreButton() {
    const loadMoreButton = ReactDOM.findDOMNode(this.refs.loadMore);
    if (loadMoreButton) {
      $(loadMoreButton).button('reset');
    }
  },

  loadElementsByTypeFromServer(type = this.props.params.type) {
    const { synthesis } = this.props;
    SynthesisElementActions.loadElementsFromServer(
      synthesis.id,
      type,
      this.state.offset,
      this.state.limit,
    );
  },

  loadMore() {
    $(ReactDOM.findDOMNode(this.refs.loadMore)).button('loading');
    this.setState(
      {
        isLoadingMore: true,
        limit: this.state.limit + Pagination,
      },
      () => {
        this.loadElementsByTypeFromServer().then(() => {
          this.resetLoadMoreButton();
        });
      },
    );
  },

  renderList() {
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
  },

  renderLoadMore() {
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
          {<FormattedMessage id="synthesis.common.elements.more" />}
        </button>
      );
    }
  },

  render() {
    return (
      <div className="synthesis__inbox">
        <Loader show={this.state.isLoading} />
        {this.renderList()}
        {this.renderLoadMore()}
      </div>
    );
  },
});

export default ElementsInbox;
