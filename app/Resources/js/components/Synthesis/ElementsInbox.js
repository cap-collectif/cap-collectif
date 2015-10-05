import ElementsList from './ElementsList';
import Loader from '../Utils/Loader';
import SynthesisElementStore from '../../stores/SynthesisElementStore';
import SynthesisElementActions from '../../actions/SynthesisElementActions';

const Pagination = 15;

const ElementsInbox = React.createClass({
  propTypes: {
    params: React.PropTypes.object,
    synthesis: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

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

  getDefaultProps() {
    return {
      params: {type: 'new'},
    };
  },

  componentWillMount() {
    SynthesisElementStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    this.onChange();
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.type !== this.props.params.type) {
      this.setState({
        isLoading: true,
        limit: Pagination,
      }, () => {
        this.loadElementsByTypeFromServer(nextProps.params.type);
      });
    }
  },

  componentWillUnmount() {
    SynthesisElementStore.removeChangeListener(this.onChange);
  },

  onChange() {
    if (!SynthesisElementStore.isProcessing && SynthesisElementStore.isInboxSync[this.props.params.type]) {
      this.setState({
        elements: SynthesisElementStore.elements[this.props.params.type],
        count: SynthesisElementStore.counts[this.props.params.type],
        isLoading: false,
        isLoadingMore: false,
      });
      this.resetLoadMoreButton();
      return;
    }

    this.setState({
      isLoading: true,
    }, () => {
      this.loadElementsByTypeFromServer();
    });
  },

  renderList() {
    if (!this.state.isLoading) {
      if (this.state.elements.length > 0) {
        return (
          <ElementsList elements={this.state.elements} />
        );
      }
      return (
        <div className="synthesis__list--empty  text-center">
          <p className="icon  cap-bubble-attention-6"></p>
          <p>{this.getIntlMessage('edition.list.none')}</p>
        </div>
      );
    }
  },

  renderLoadMore() {
    if (!this.state.isLoading && (this.state.limit < this.state.count || this.state.isLoadingMore)) {
      return (
        <button className="btn btn-block btn-dark-grey" ref="loadMore" data-loading-text={this.getIntlMessage('common.loading')} onClick={this.loadMore.bind(this)}>
          { this.getIntlMessage('common.elements.more') }
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

  resetLoadMoreButton() {
    const loadMoreButton = React.findDOMNode(this.refs.loadMore);
    if (loadMoreButton) {
      $(loadMoreButton).button('reset');
    }
  },

  loadElementsByTypeFromServer(type = this.props.params.type) {
    SynthesisElementActions.loadElementsFromServer(
      this.props.synthesis.id,
      type,
      this.state.offset,
      this.state.limit
    );
  },

  loadMore() {
    $(React.findDOMNode(this.refs.loadMore)).button('loading');
    this.setState({
      isLoadingMore: true,
      limit: this.state.limit + Pagination,
    }, () => {
      this.loadElementsByTypeFromServer();
    });
  },

});

export default ElementsInbox;
