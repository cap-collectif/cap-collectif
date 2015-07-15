import ElementTitle from './ElementTitle';
import ElementBlock from './ElementBlock';
import ElementButtons from './ElementButtons';
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
  },

  onChange() {
    if (SynthesisElementStore.isSync) {
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
                <ElementBlock element={this.state.element} />
              </div>
              <div className="element__description box has-chart">
                <p>{element.body.replace(/(<([^>]+)>)/ig, '')}</p>
              </div>
              <ElementButtons {...this.props} element={this.state.element} />
            </div>
          </div>
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
      <div className="block synthesis--edit__content">
        {this.renderLoader()}
        {this.renderElementPanel()}
      </div>
    );
  },

  loadElementFromServer() {
    SynthesisElementActions.loadElementFromServer(
      this.props.synthesis.id,
      this.props.params.element_id
    );
  },

});

export default EditElement;
