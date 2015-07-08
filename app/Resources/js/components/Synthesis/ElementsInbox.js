import Fetcher from '../../services/Fetcher';
import ElementsList from './ElementsList';

var ElementsInbox = React.createClass({
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      newElements: []
    };
  },

  componentDidMount() {
    this.loadNewElementsFromServer();
  },

  render() {
    return (
      <div className="block block--bordered synthesis--edit__content">
        {this.renderList()}
      </div>
    );
  },

  renderList() {
    if (this.state.newElements.length > 0) {
      return (
        <ElementsList elements={this.state.newElements} />
      );
    }
    return (
      <div className="box synthesis__elements-list--empty  text-center">
        <p className="icon  cap-bubble-attention-6"></p>
        <p>{this.getIntlMessage('edition.inbox.none')}</p>
      </div>
    );

  },

  loadNewElementsFromServer() {
    Fetcher
      .get('/syntheses/'+ this.props.synthesis.id + '/elements/new')
      .then((data) => {
        this.setState({
          'newElements': data
        });
      });
  }

});

export default ElementsInbox;
