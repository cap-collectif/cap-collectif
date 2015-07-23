import ViewElement from './ViewElement';
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
    this.loadRootElementsFromServer();
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
      this.loadRootElementsFromServer();
    });
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
      <div className="synthesis__view">
        {this.renderLoader()}
        {this.renderElementsList()}
      </div>
    );
  },

  loadRootElementsFromServer() {
    SynthesisElementActions.loadElementsTreeFromServer(
      this.props.synthesis.id
    );
  },

});

export default ViewBox;
