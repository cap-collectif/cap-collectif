import ViewElement from './ViewElement';
import Fetcher from '../../services/Fetcher';

const ViewBox = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      elements: [],
    };
  },

  componentDidMount() {
    this.loadArchivedElementsFromServer();
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
        {this.renderElementsList()}
      </div>
    );
  },

  loadArchivedElementsFromServer() {
    Fetcher
      .get('/syntheses/' + this.props.synthesis.id + '/elements/archived')
      .then((data) => {
        this.setState({
          'elements': data,
        });
      });
  },

});

export default ViewBox;
