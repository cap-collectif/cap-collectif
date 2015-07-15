import ElementsList from './ElementsList';
import SynthesisElementStore from '../../stores/SynthesisElementStore';
import SynthesisElementActions from '../../actions/SynthesisElementActions';

const ElementsInbox = React.createClass({
  propTypes: {
    params: React.PropTypes.object,
    synthesis: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      elements: [],
      isLoading: true,
    };
  },

  componentWillMount() {
    SynthesisElementStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    this.loadElementsByTypeFromServer();
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.params.type !== this.props.params.type) {
      this.setState({
        isLoading: true,
      });
      this.loadElementsByTypeFromServer();
    }
  },

  componentWillUnmount() {
    SynthesisElementStore.removeChangeListener(this.onChange);
  },

  onChange() {
    if (SynthesisElementStore.isSync) {
      this.setState({
        elements: SynthesisElementStore.elements,
        isLoading: false,
      });
      return;
    }

    this.setState({
      isLoading: true,
    }, () => {
      this.loadElementsByTypeFromServer();
    });
  },

  renderList() {
    if (!this.state.isLoading) {
      if (this.state.elements.length > 0) {
        return (
          <ElementsList elements={this.state.elements} />
        );
      }
      return (
        <div className="box synthesis__elements-list--empty  text-center">
          <p className="icon  cap-bubble-attention-6"></p>
          <p>{this.getIntlMessage('edition.inbox.none')}</p>
        </div>
      );
    }
  },

  renderLoader() {
    if (this.state.isLoading) {
      return (
        <div className= "row">
          <div className="col-xs-2 col-xs-offset-5 spinner-loader-container">
            <div className="spinner-loader"></div>
          </div>
        </div>
      );
    }
  },

  render() {
    return (
      <div className="block block--bordered synthesis--edit__content">
        {this.renderLoader()}
        {this.renderList()}
      </div>
    );
  },

  loadElementsByTypeFromServer() {
    SynthesisElementActions.loadElementsFromServer(
      this.props.synthesis.id,
      this.props.params.type
    );
  },

});

export default ElementsInbox;
