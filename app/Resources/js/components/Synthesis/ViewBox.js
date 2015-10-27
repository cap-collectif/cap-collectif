import ViewElement from './ViewElement';
import Loader from '../Utils/Loader';
import SynthesisElementStore from '../../stores/SynthesisElementStore';
import SynthesisElementActions from '../../actions/SynthesisElementActions';

const ViewBox = React.createClass({
  propTypes: {
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
    this.fetchRootElements();
  },

  componentWillUnmount() {
    SynthesisElementStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.fetchRootElements();
  },

  fetchRootElements() {
    if (!SynthesisElementStore.isProcessing) {
      if (SynthesisElementStore.isInboxSync.publishedTree) {
        this.setState({
          elements: SynthesisElementStore.elements.publishedTree,
          isLoading: false,
        });
        return;
      }

      this.setState({
        isLoading: true,
      }, () => {
        this.loadRootElementsFromServer();
      });
    }
  },

  loadRootElementsFromServer() {
    SynthesisElementActions.loadElementsTreeFromServer(
      this.props.synthesis.id,
      'published'
    );
  },

  renderElementsList() {
    if (this.props.synthesis !== null && this.props.synthesis.enabled && this.state.elements.length > 0) {
      return (
        <ul className="synthesis__elements">
          {
            this.state.elements.map((element) => {
              return (
                <ViewElement key={element.id} element={element} synthesis={this.props.synthesis} />
              );
            })
          }
        </ul>
      );
    }
  },

  render() {
    return (
      <div className="synthesis__view">
        <Loader show={this.state.isLoading} />
        {this.renderElementsList()}
      </div>
    );
  },

});

export default ViewBox;
