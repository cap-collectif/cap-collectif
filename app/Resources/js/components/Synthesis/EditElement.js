import ElementTitle from './ElementTitle';
import ElementBlock from './ElementBlock';
import ElementButtons from './ElementButtons';
import PublishModal from './PublishModal';
import SynthesisElementStore from '../../stores/SynthesisElementStore';
import SynthesisElementActions from '../../actions/SynthesisElementActions';

const EditElement = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
    params: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      element: null,
      isLoading: true,
      showModal: false,
    };
  },

  componentWillMount() {
    SynthesisElementStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    this.loadElementFromServer();
  },

  componentWillUnmount() {
    SynthesisElementStore.removeChangeListener(this.onChange);
    this.toggleModal(false);
  },

  onChange() {
    if (!SynthesisElementStore.isProcessing && SynthesisElementStore.isElementSync) {
      this.setState({
        element: SynthesisElementStore.element,
        isLoading: false,
      });
      return;
    }

    this.loadElementFromServer();
  },

  renderElementPanel() {
    const element = this.state.element;
    if (!this.state.isLoading && element) {
      return (
        <div className="panel panel-warning synthesis__element-panel">
          <div className="panel-heading box">
            <h3 className="element__title panel-title">
              <ElementTitle element={element} />
            </h3>
          </div>
          <div id="element-details">
            <div className="panel-body">
              <div className="element box">
                <ElementBlock element={element} />
              </div>
              <div className="element__description box has-chart">
                {this.renderElementBody()}
              </div>
              <ElementButtons {...this.props} element={element} onModal={this.toggleModal} />
            </div>
          </div>
        </div>
      );
    }
  },

  renderElementBody() {
    if (this.state.element.body) {
      return <p>{this.state.element.body.replace(/(<([^>]+)>)/ig, '')}</p>;
    }
  },

  renderPublishModal() {
    const element = this.state.element;
    if (element) {
      return (
        <PublishModal synthesis={this.props.synthesis} element={element} show={this.state.showModal} toggle={this.toggleModal} />
      );
    }
  },

  renderLoader() {
    if (this.state.isLoading) {
      return (
        <div className="row">
          <div className="col-xs-2 col-xs-offset-5 spinner-loader-container">
            <div className="spinner-loader"></div>
          </div>
        </div>
      );
    }
  },

  render() {
    return (
      <div className="block synthesis--edit__content">
        {this.renderLoader()}
        {this.renderElementPanel()}
        {this.renderPublishModal()}
      </div>
    );
  },

  toggleModal(value) {
    this.setState({
      showModal: value,
    });
  },

  loadElementFromServer() {
    SynthesisElementActions.loadElementFromServer(
      this.props.synthesis.id,
      this.props.params.element_id
    );
  },

});

export default EditElement;
