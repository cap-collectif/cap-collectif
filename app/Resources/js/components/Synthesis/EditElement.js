import SynthesisElementStore from '../../stores/SynthesisElementStore';
import SynthesisElementActions from '../../actions/SynthesisElementActions';
import FormattedText from '../../services/FormattedText';
import Loader from '../Utils/Loader';
import ElementTitle from './ElementTitle';
import ElementBlock from './ElementBlock';
import PublishButton from './PublishButton';
import DivideButton from './DivideButton';
import IgnoreButton from './IgnoreButton';
import PublishModal from './PublishModal';
import DivideModal from './DivideModal';

const FormattedDate = ReactIntl.FormattedDate;

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
      showPublishModal: false,
      showDivideModal: false,
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
    this.toggleDivideModal(false);
    this.togglePublishModal(false);
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
                {FormattedText.strip(element.body)}
              </div>
              {this.renderElementButtons()}
            </div>
          </div>
        </div>
      );
    }
  },

  renderElementButtons() {
    return (
      <div className="element__actions box text-center">
        <PublishButton element={this.state.element} onModal={this.togglePublishModal} />
        <DivideButton element={this.state.element} onModal={this.toggleDivideModal} />
        <IgnoreButton synthesis={this.props.synthesis} element={this.state.element} />
      </div>
    );
  },

  renderHistory() {
    const element = this.state.element;
    if (element && element.logs.length > 0) {
      return (
        <ul className="element__history">
          {
            element.logs.map((log) => {
              return log.sentences.map((sentence) => {
                return this.renderLogSentence(sentence, log.logged_at);
              });
            })
          }
        </ul>
      );
    }
  },

  renderLogSentence(sentence, date) {
    return (
      <li className="element__history__log">
        {sentence}
        <span className="excerpt small pull-right">
          <FormattedDate value={date} day="numeric" month="long" year="numeric" hour="numeric" minute="numeric" />
        </span>
      </li>
    );
  },

  renderPublishModal() {
    const element = this.state.element;
    if (element) {
      return (
        <PublishModal synthesis={this.props.synthesis} element={element} show={this.state.showPublishModal} toggle={this.togglePublishModal} />
      );
    }
  },

  renderDivideModal() {
    const element = this.state.element;
    if (element) {
      return (
        <DivideModal synthesis={this.props.synthesis} element={element} show={this.state.showDivideModal} toggle={this.toggleDivideModal} />
      );
    }
  },

  render() {
    return (
      <div className="block synthesis--edit__content">
        <Loader show={this.state.isLoading} />
        {this.renderElementPanel()}
        {this.renderHistory()}
        {this.renderPublishModal()}
        {this.renderDivideModal()}
      </div>
    );
  },

  togglePublishModal(value) {
    this.setState({
      showDivideModal: false,
      showPublishModal: value,
    });
  },

  toggleDivideModal(value) {
    this.setState({
      showPublishModal: false,
      showDivideModal: value,
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
