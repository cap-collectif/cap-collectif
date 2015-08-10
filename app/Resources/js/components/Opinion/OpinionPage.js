import OpinionVersionList from './OpinionVersionList';
import OpinionVersionForm from './OpinionVersionForm';
import OpinionBox from './OpinionBox';
import OpinionTabs from './OpinionTabs';
import OpinionActions from '../../actions/OpinionActions';
import Fetcher from '../../services/Fetcher';

const OpinionPage = React.createClass({
  propTypes: {
    opinionId: React.PropTypes.number,
    opinionInitialText: React.PropTypes.text,
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

    Fetcher
    .get('/opinions/' + this.props.opinionId +
         '/versions/' + this.props.versionId
    )
    .then((data) => {
      this.setState({
        opinion: data.version,
        isLoading: false
      });
      return true;
    });

  },

  renderLoader() {
    if (this.state.isLoading) {
      return (
        <div className= "row">
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

});

export default OpinionPage;
