import Fetcher from '../../services/Fetcher';
import ElementsList from './ElementsList';

var ElementsAll = React.createClass({
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      elements: []
    };
  },

  componentDidMount() {
    this.loadAllElementsFromServer();
  },

  render() {
    return (
      <div className="block block--bordered synthesis--edit__content">
        {this.renderList()}
      </div>
    );
  },

  renderList() {
    if (this.state.elements.length > 0) {
      return (
        <ElementsList elements={this.state.elements} />
      );
    }
    return (
      <div className="box synthesis__elements-list--empty  text-center">
        <p className="icon  cap-bubble-attention-6"></p>
        <p>{this.getIntlMessage('edition.all.none')}</p>
      </div>
    );

  },

  loadAllElementsFromServer() {
    Fetcher
      .get('/syntheses/'+ this.props.synthesis.id + '/elements')
      .then((data) => {
        this.setState({
          'elements': data
        });
      });
  }

});

export default ElementsAll;
