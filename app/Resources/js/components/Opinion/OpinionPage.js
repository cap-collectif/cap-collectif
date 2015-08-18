import OpinionBox from './OpinionBox';
import OpinionTabs from './OpinionTabs';
import Fetcher from '../../services/Fetcher';
import Loader from '../Utils/Loader';

const Row = ReactBootstrap.Row;
const Col = ReactBootstrap.Col;

const OpinionPage = React.createClass({
  propTypes: {
    opinionId: React.PropTypes.number.isRequired,
    versionId: React.PropTypes.number,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      opinion: null,
      isLoading: true,
    };
  },

  componentDidMount() {
    this.loadOpinion();
  },

  render() {
    return (
      <Col xs={12} sm={8} md={9} className="has-chart">
        <Row>
          <Loader show={this.state.isLoading} />
          {!this.state.isLoading
            ? <OpinionBox {...this.props} opinion={this.state.opinion} />
            : <span />
          }
          {!this.state.isLoading && this.state.opinion.parent // for now only version use full react tabs
            ? <OpinionTabs {...this.props} opinion={this.state.opinion} />
            : <span />
          }
        </Row>
      </Col>
    );
  },

  loadOpinion() {
    if (this.props.versionId) {
      Fetcher
      .get(`/opinions/${this.props.opinionId}/versions/${this.props.versionId}`)
      .then((data) => {
        this.setState({
          opinion: data.version,
          isLoading: false,
        });
        return true;
      });
      return;
    }
    Fetcher
    .get(`/opinions/${this.props.opinionId}`)
    .then((data) => {
      this.setState({
        opinion: data.opinion,
        isLoading: false,
      });
      return true;
    });
  },

});

export default OpinionPage;
