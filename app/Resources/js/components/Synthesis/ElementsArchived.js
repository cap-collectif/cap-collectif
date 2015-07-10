import Fetcher from '../../services/Fetcher';
import ElementsList from './ElementsList';

var ElementsArchived = React.createClass({
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      archivedElements: []
    };
  },

  componentDidMount() {
    this.loadArchivedElementsFromServer();
  },

  render() {
    return (
      <div className="block block--bordered synthesis--edit__content">
        {this.renderList()}
      </div>
    );
  },

  renderList() {
    if (this.state.archivedElements.length > 0) {
      return (
        <ElementsList elements={this.state.archivedElements} />
      );
    }
    return (
      <div className="box synthesis__elements-list--empty  text-center">
        <p className="icon  cap-bubble-attention-6"></p>
        <p>{this.getIntlMessage('edition.archived.none')}</p>
      </div>
    );

  },

  loadArchivedElementsFromServer() {
    Fetcher
      .get('/syntheses/'+ this.props.synthesis.id + '/elements/archived')
      .then((data) => {
        this.setState({
          'archivedElements': data
        });
      });
  }

});

export default ElementsArchived;
