import OpinionSourceList from './OpinionSourceList';
import OpinionSourceForm from './OpinionSourceForm';
import Loader from '../Utils/Loader';
import Fetcher from '../../services/Fetcher';

const Row = ReactBootstrap.Row;
const Col = ReactBootstrap.Col;

const OpinionSourcesBox = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
    isReportingEnabled: React.PropTypes.bool.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
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
    this.loadCategoriesFromServer();
  },

  componentDidUpdate(prevProps, prevState) {
    if (this.state.filter !== prevState.filter) {
      this.loadSourcesFromServer();
    }
  },

  renderFilter() {
    if (this.state.sources.length > 1) {
      return (
        <select ref="filter" className="form-control pull-right" value={this.state.filter} onChange={() => this.updateSelectedValue()}>
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
        {this.props.opinion.isContribuable
          ? <Row>
              <Col xs={12} sm={6} md={6}>
                <OpinionSourceForm opinion={this.props.opinion} categories={this.state.categories} />
              </Col>
              <Col xs={12} sm={6} md={6}>
                { this.renderFilter() }
              </Col>
            </Row>
          : this.renderFilter()
        }
        {!this.state.isLoading
          ? <OpinionSourceList isReportingEnabled={this.props.isReportingEnabled} sources={this.state.sources} />
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

    const baseUrl = this.isVersion()
      ? `/opinions/${this.props.opinion.parent.id}/versions/${this.props.opinion.id}`
      : `/opinions/${this.props.opinion.id}`
    ;

    Fetcher
      .get(`${baseUrl}/sources?offset=${this.state.offset}&limit=${this.state.limit}&filter=${this.state.filter}`)
      .then((data) => {
        this.setState({
          isLoading: false,
          sources: data.sources,
        });
        return true;
      });
  },

  loadCategoriesFromServer() {
    Fetcher
      .get('/categories')
      .then((data) => {
        this.setState({categories: data});
        return true;
      });
  },

  isVersion() {
    return !!this.props.opinion.parent;
  },

});

export default OpinionSourcesBox;
