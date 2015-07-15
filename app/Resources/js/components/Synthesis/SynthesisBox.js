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
      errors: [],
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
      errors: SynthesisElementStore.errors,
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

  renderErrors() {
    if (this.state.errors.length > 0) {
      return (
        <div className="alert alert-danger alert-dismissible">
          <button type="button" className="close" data-dismiss="alert" aria-label={this.getIntlMessage('common.errors.close')}>
            <span aria-hidden="true">&times;</span>
          </button>
          {
            this.state.errors.map((error) => {
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

  render() {
    return (
      <div className="synthesis__box" >
        {this.renderErrors()}
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

