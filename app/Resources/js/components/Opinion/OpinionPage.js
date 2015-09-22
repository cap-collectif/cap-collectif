import OpinionStore from '../../stores/OpinionStore';
import OpinionActions from '../../actions/OpinionActions';

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

  componentWillMount() {
    OpinionStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    this.loadOpinion();
  },

  componentWillUnmount() {
    OpinionStore.removeChangeListener(this.onChange);
  },

  onChange() {
    if (!OpinionStore.isProcessing && OpinionStore.isOpinionSync) {
      this.setState({
        opinion: OpinionStore.opinion,
        isLoading: false,
      });
      return;
    }

    this.loadElementFromServer();
  },

  render() {
    console.log(this.state.opinion);
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
    OpinionActions.loadOpinion(
      this.props.opinionId,
      this.props.versionId
    );
  },

});

export default OpinionPage;
