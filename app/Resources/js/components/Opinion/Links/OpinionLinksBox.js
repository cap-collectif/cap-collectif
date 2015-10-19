import OpinionLinkList from './OpinionLinkList';
import OpinionLinkCreate from './OpinionLinkCreate';
import Filter from '../../Utils/Filter';
import Loader from '../../Utils/Loader';
import OpinionLinkActions from '../../../actions/OpinionLinkActions';
import OpinionLinkStore from '../../../stores/OpinionLinkStore';

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
    };
  },

  componentWillMount() {
    OpinionLinkStore.addChangeListener(this.onChange);
  },

  componentDidUpdate(prevProps, prevState) {
    if (this.state.filter !== prevState.filter) {
      OpinionLinkActions.load(this.props.opinion.id, this.state.filter);
    }
  },

  componentWillUnmount() {
    OpinionLinkStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.setState({
      links: OpinionLinkStore.links,
      isLoading: false,
    });
  },

  render() {
    return (
      <div>
        <Row>
          <Col xs={12} sm={6} md={6}>
            <OpinionLinkCreate {...this.props} />
          </Col>
          <Col xs={12} sm={6} md={6} className="block--first-mobile">
            {this.state.links.length > 1
              ? <Filter
                  onChange={this.handleFilterChange}
                  value={this.state.filter}
                  values={['last', 'old']}
                />
              : null
            }
          </Col>
        </Row>
        {!this.state.isLoading
          ? <OpinionLinkList links={this.state.links} />
          : <Loader />
        }
      </div>
    );
  },

  handleFilterChange(event) {
    this.setState({
      filter: event.target.value,
      isLoading: true,
      links: [],
    });
  },

});

export default OpinionLinksBox;
