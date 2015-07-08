import UserAvatar from '../User/UserAvatar';
import UserLink from '../User/UserLink';
import Fetcher from '../../services/Fetcher';
import ElementTitle from './ElementTitle';
import ElementBlock from './ElementBlock';
import ElementButtons from './ElementButtons';
import SynthesisElementStore from '../../stores/SynthesisElementStore';
import SynthesisElementActions from '../../actions/SynthesisElementActions';

var EditElement = React.createClass({
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      element: null
    };
  },

  componentWillMount() {
    SynthesisElementStore.addChangeListener(this.onChange);
  },

  componentWillUnmount() {
    SynthesisElementStore.removeChangeListener(this.onChange);
  },

  componentDidMount() {
    this.loadElementFromServer();
  },

  render() {
    var element = this.props.element;
    return (
      <div className="block synthesis--edit__content">
        {this.renderElementPanel()}
      </div>
    );
  },

  renderElementPanel() {
    if (this.state.element) {
      var element = this.state.element;
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
                <p>{element.body.replace(/(<([^>]+)>)/ig,"")}</p>
              </div>
              <ElementButtons {...this.props} element={this.state.element} />
            </div>
          </div>
        </div>
      );
    }
  },

  onChange() {
    if (SynthesisElementStore.isSync) {
      this.setState({
        element: SynthesisElementStore.element
      });
      return;
    }
    this.loadElementFromServer();
  },

  loadElementFromServer() {
    SynthesisElementActions.loadElementFromServer(
      this.props.synthesis.id,
      this.props.params.element_id
    );
  }

});

export default EditElement;
