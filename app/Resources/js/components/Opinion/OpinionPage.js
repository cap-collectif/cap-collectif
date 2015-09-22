import OpinionStore from '../../stores/OpinionStore';
import OpinionActions from '../../actions/OpinionActions';
import FlashMessages from '../Utils/FlashMessages';

import OpinionBox from './OpinionBox';
import OpinionTabs from './OpinionTabs';
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
      messages: {
        errors: [],
        success: [],
      },
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
        rankingThreshold: OpinionStore.rankingThreshold,
        isLoading: false,
        messages: OpinionStore.messages,
      });
      return;
    }

    this.loadElementFromServer();
  },

  render() {
    return (
      <div className="has-chart">
        <FlashMessages errors={this.state.messages.errors} success={this.state.messages.success} />
        <Loader show={this.state.isLoading} />
        {!this.state.isLoading && this.state.opinion
          ? <OpinionBox {...this.props} rankingThreshold={this.state.rankingThreshold} opinion={this.state.opinion} />
          : null
        }
        {!this.state.isLoading && this.state.opinion
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
