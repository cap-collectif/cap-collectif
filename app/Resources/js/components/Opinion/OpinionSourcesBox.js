import OpinionSourceList from './OpinionSourceList';
import OpinionSourceForm from './OpinionSourceForm';
import Loader from '../Utils/Loader';
import Fetcher from '../../services/Fetcher';

const OpinionSourcesBox = React.createClass({
  propTypes: {
    opinionId: React.PropTypes.number.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      isOpinionContributable: false,
      opinion: {id: this.props.opinionId, parent: null},
      sources: [],
      categories: [],
      isLoading: true,
      filter: 'last',
      offset: 0,
      limit: 50,
    };
  },

  componentDidMount() {
    this.loadSourcesFromServer();
    Fetcher
    .get('/categories')
    .then((data) => {
      this.setState({categories: data});
      return true;
    });
  },

  componentDidUpdate(prevProps, prevState) {
    if (this.state.filter !== prevState.filter) {
      this.loadSourcesFromServer();
    }
  },

  renderFilter() {
    if (this.state.sources.length > 1) {
      return (
        <select ref="filter" className="hidden-xs pull-right" value={this.state.filter} onChange={() => this.updateSelectedValue()}>
          <option value="popular">{this.getIntlMessage('global.filter_popular')}</option>
          <option value="last">{this.getIntlMessage('global.filter_last')}</option>
          <option value="old">{this.getIntlMessage('global.filter_old')}</option>
        </select>
      );
    }
  },

  render() {
    return (
      <div>
        {this.state.isOpinionContributable
          ? <OpinionSourceForm opinion={this.state.opinion} categories={this.state.categories} />
          : <span />
        }
        { this.renderFilter() }
        {!this.state.isLoading
          ? <OpinionSourceList sources={this.state.sources} />
          : <Loader />
        }
      </div>
    );
  },

  updateSelectedValue() {
    this.setState({
      filter: $(React.findDOMNode(this.refs.filter)).val(),
      isLoading: true,
      sources: [],
    });
  },

  loadSourcesFromServer() {
    this.setState({'isLoading': true});

    Fetcher
    .get(`/opinions/${this.props.opinionId}/sources?offset=${this.state.offset}&limit=${this.state.limit}&filter=${this.state.filter}`)
    .then((data) => {
      this.setState({
        isLoading: false,
        sources: data.sources,
        isOpinionContributable: data.isOpinionContributable,
      });
      return true;
    });
  },

});

export default OpinionSourcesBox;
