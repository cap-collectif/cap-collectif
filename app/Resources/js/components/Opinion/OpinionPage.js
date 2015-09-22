import OpinionBox from './OpinionBox';
import OpinionTabs from './OpinionTabs';
import Fetcher from '../../services/Fetcher';
import Loader from '../Utils/Loader';

const OpinionPage = React.createClass({
  propTypes: {
    opinionId: React.PropTypes.number.isRequired,
    versionId: React.PropTypes.number,
    isReportingEnabled: React.PropTypes.bool.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      opinion: null,
      isLoading: true,
      rankingThreshold: null,
    };
  },

  componentDidMount() {
    this.loadOpinion();
  },

  render() {
    return (
      <div className="has-chart">
        <Loader show={this.state.isLoading} />
        {!this.state.isLoading
          ? <OpinionBox {...this.props} rankingThreshold={this.state.rankingThreshold} opinion={this.state.opinion} />
          : null
        }
        {!this.state.isLoading
          ? <OpinionTabs {...this.props} opinion={this.state.opinion} />
          : null
        }
      </div>
    );
  },

  loadOpinion() {
    if (this.props.versionId) {
      Fetcher
      .get(`/opinions/${this.props.opinionId}/versions/${this.props.versionId}`)
      .then((data) => {
        this.setState({
          opinion: data.version,
          rankingThreshold: data.rankingThreshold,
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
        rankingThreshold: data.rankingThreshold,
        isLoading: false,
      });
      return true;
    });
  },

});

export default OpinionPage;
