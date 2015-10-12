import OpinionLinkList from './OpinionLinkList';
import OpinionLinkForm from './OpinionLinkForm';
import Filter from '../Utils/Filter';
import Loader from '../Utils/Loader';

const Row = ReactBootstrap.Row;
const Col = ReactBootstrap.Col;

const OpinionLinksBox = React.createClass({
  propTypes: {
    opinion: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      links: this.props.opinion.connections,
      isLoading: false,
      filter: 'last',
      offset: 0,
      limit: 50,
    };
  },

  componentDidUpdate(prevProps, prevState) {
    if (this.state.filter !== prevState.filter) {
      this.loadLinksFromServer();
    }
  },

  handleFilterChange() {
    this.setState({
      filter: $(React.findDOMNode(this.refs.filter)).val(),
      isLoading: true,
      links: [],
    });
  },

  render() {
    return (
      <div>
        <Row>
          <Col xs={12} sm={6} md={6}>
            <OpinionLinkForm {...this.props} />
          </Col>
          <Col xs={12} sm={6} md={6} className="block--first-mobile">
            <Filter onChange={this.handleFilterChange} value={this.state.filter} />
          </Col>
        </Row>
        {!this.state.isLoading
          ? <OpinionLinkList links={this.state.links} />
          : <Loader />
        }
      </div>
    );
  },

});

export default OpinionLinksBox;
