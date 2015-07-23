import Fetcher from '../../services/Fetcher';
import ViewBox from './ViewBox';
import EditBox from './EditBox';
import SynthesisElementStore from '../../stores/SynthesisElementStore';

const SynthesisBox = React.createClass({
  propTypes: {
    mode: React.PropTypes.string,
    synthesis_id: React.PropTypes.string,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      synthesis: null,
      messages: {
        'errors': [],
        'success': [],
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

  renderErrorMessages() {
    if (this.state.messages.errors.length > 0) {
      return (
        <div className="alert alert-danger alert-dismissible">
          <button type="button" className="close" data-dismiss="alert" aria-label={this.getIntlMessage('common.errors.close')}>
            <span aria-hidden="true">&times;</span>
          </button>
          {
            this.state.messages.errors.map((error) => {
              return (
                <p className="error">
                  {this.getIntlMessage(error)}
                </p>
              );
            })
          }
        </div>
      );
    }
  },

  renderSuccessMessages() {
    if (this.state.messages.success.length > 0) {
      return (
        <div className="alert alert-success alert-dismissible">
          <button type="button" className="close" data-dismiss="alert" aria-label={this.getIntlMessage('common.errors.close')}>
            <span aria-hidden="true">&times;</span>
          </button>
          {
            this.state.messages.success.map((success) => {
              return (
                <p className="success">
                  {this.getIntlMessage(success)}
                </p>
              );
            })
            }
        </div>
      );
    }
  },


  render() {
    return (
      <div className="synthesis__box" >
        {this.renderErrorMessages()}
        {this.renderSuccessMessages()}
        { this.renderBoxMode() }
      </div>
    );
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

});

export default SynthesisBox;

