import Fetcher from '../../services/Fetcher';
import ViewBox from './ViewBox';
import EditBox from './EditBox';
import FlashMessages from '../Utils/FlashMessages';
import SynthesisElementStore from '../../stores/SynthesisElementStore';

const SynthesisBox = React.createClass({
  propTypes: {
    mode: React.PropTypes.string,
    synthesis_id: React.PropTypes.string.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      synthesis: null,
      messages: {
        errors: [],
        success: [],
      },
    };
  },

  componentWillMount() {
    SynthesisElementStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    this.loadSynthesisFromServer();
  },

  componentWillUnmount() {
    SynthesisElementStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.setState({
      messages: SynthesisElementStore.messages,
     });
  },

  loadSynthesisFromServer() {
    Fetcher
      .get('/syntheses/' + this.props.synthesis_id)
      .then((data) => {
        this.setState({
          'synthesis': data,
        });
      });
  },

  renderBoxMode() {
    if (this.state.synthesis !== null) {
      if (this.props.mode === 'view') {
        return (
          <ViewBox synthesis={this.state.synthesis} />
        );
      }
      if (this.props.mode === 'edit') {
        return (
          <EditBox synthesis={this.state.synthesis} />
        );
      }
      return (
        <p>{this.getIntlMessage('common.errors.incorrect_mode')}</p>
      );
    }
  },

  render() {
    return (
      <div className="synthesis__box" >
        <FlashMessages errors={this.state.messages.errors} success={this.state.messages.success} />
        { this.renderBoxMode() }
      </div>
    );
  },

});

export default SynthesisBox;

