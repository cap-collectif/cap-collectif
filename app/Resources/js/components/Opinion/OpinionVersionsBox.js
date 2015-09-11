import OpinionVersionList from './OpinionVersionList';
import OpinionVersionForm from './OpinionVersionForm';
import Loader from '../Utils/Loader';
import Fetcher from '../../services/Fetcher';

const Row = ReactBootstrap.Row;
const Col = ReactBootstrap.Col;

const OpinionVersionsBox = React.createClass({
  propTypes: {
    opinionId: React.PropTypes.number.isRequired,
    opinionBody: React.PropTypes.string.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      versions: [],
      isLoading: true,
      filter: 'last',
      offset: 0,
      limit: 50,
    };
  },

  componentDidMount() {
    this.loadVersionsFromServer();
  },

  componentDidUpdate(prevProps, prevState) {
    if (this.state.filter !== prevState.filter) {
      this.loadVersionsFromServer();
    }
  },

  renderFilter() {
    if (this.state.versions.length > 1) {
      return (
        <select ref="filter" className="form-control pull-right" value={this.state.filter} onChange={() => this.updateSelectedValue()}>
          <option value="last">{this.getIntlMessage('global.filter_last')}</option>
          <option value="old">{this.getIntlMessage('global.filter_old')}</option>
          <option value="popular">{this.getIntlMessage('global.filter_popular')}</option>
          <option value="comments">{this.getIntlMessage('global.filter_comments')}</option>
        </select>
      );
    }
  },

  render() {
    return (
      <div>
        <Row>
          <Col xs={12} sm={6} md={6}>
            <OpinionVersionForm {...this.props} />
          </Col>
          <Col xs={12} sm={6} md={6} className="block--first-mobile">
            { this.renderFilter() }
          </Col>
        </Row>
        {!this.state.isLoading
          ? <OpinionVersionList versions={this.state.versions} />
          : <Loader />
        }
      </div>
    );
  },

  updateSelectedValue() {
    this.setState({
      filter: $(React.findDOMNode(this.refs.filter)).val(),
      isLoading: true,
      versions: [],
    });
  },

  loadVersionsFromServer() {
    this.setState({'isLoading': true});

    Fetcher
    .get(`/opinions/${this.props.opinionId}/versions?offset=${this.state.offset}&limit=${this.state.limit}&filter=${this.state.filter}`)
    .then((data) => {
      this.setState({
        'isLoading': false,
        'versions': data.versions,
      });
      return true;
    });
  },

});

export default OpinionVersionsBox;
