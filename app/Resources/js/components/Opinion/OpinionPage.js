import OpinionBox from './OpinionBox';
import OpinionTabs from './OpinionTabs';
import Fetcher from '../../services/Fetcher';

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

  renderLoader() {
    if (this.state.isLoading) {
      return (
        <div className="row">
          <div className="col-xs-2 col-xs-offset-6">
            <div className="spinner-loader"></div>
          </div>
        </div>
      );
    }
  },

  render() {
    return (
      <div className="col-xs-12 col-sm-8 col-md-9 has-chart" id="details">
        <div className="row">
          { this.renderLoader() }
          {!this.state.isLoading
            ? <OpinionBox {...this.props} opinion={this.state.opinion} />
            : <span />
          }
          {!this.state.isLoading
            ? <OpinionTabs {...this.props} opinion={this.state.opinion} />
            : <span />
          }
        </div>
      </div>
    );
  },

  loadOpinion() {
    if (this.props.versionId) {
      Fetcher
      .get('/opinions/' + this.props.opinionId + '/versions/' + this.props.versionId)
      .then((data) => {
        this.setState({
          opinion: data.version,
          isLoading: false,
        });
        return true;
      });
    }
  },

});

export default OpinionPage;
