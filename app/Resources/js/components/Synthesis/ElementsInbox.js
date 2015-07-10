import Fetcher from '../../services/Fetcher';
import ElementsList from './ElementsList';
import SynthesisElementStore from '../../stores/SynthesisElementStore';
import SynthesisElementActions from '../../actions/SynthesisElementActions';

var ElementsInbox = React.createClass({
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      elements: [],
      isLoading: true
    };
  },

  componentWillMount() {
    SynthesisElementStore.addChangeListener(this.onChange);
  },

  componentWillUnmount() {
    SynthesisElementStore.removeChangeListener(this.onChange);
  },

  componentDidMount() {
    this.loadElementsByTypeFromServer();
  },

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.params.type !== this.props.params.type) {
      this.setState({
        isLoading: true
      });
      this.loadElementsByTypeFromServer();
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

  onChange() {
    if (SynthesisElementStore.isSync) {
      this.setState({
        elements: SynthesisElementStore.elements,
        isLoading: false
      });
      return;
    }

    this.setState({
      isLoading: true
    }, () => {
      this.loadElementsByTypeFromServer();
    });
  },

  loadElementsByTypeFromServer() {
    SynthesisElementActions.loadElementsFromServer(
      this.props.synthesis.id,
      this.props.params.type
    );
  }

});

export default ElementsInbox;
