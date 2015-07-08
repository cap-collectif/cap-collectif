import Fetcher from '../../services/Fetcher';
import ElementsList from './ElementsList';

var ElementsUnpublished = React.createClass({
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      unpublishedElements: []
    };
  },

  componentDidMount() {
    this.loadUnpublishedElementsFromServer();
  },

  render() {
    return (
      <div className="block block--bordered synthesis--edit__content">
        {this.renderList()}
      </div>
    );
  },

  renderList() {
    if (this.state.unpublishedElements.length > 0) {
      return (
        <ElementsList elements={this.state.unpublishedElements} />
      );
    }
    return (
      <div className="box synthesis__elements-list--empty  text-center">
        <p className="icon  cap-bubble-attention-6"></p>
        <p>{this.getIntlMessage('edition.unpublished.none')}</p>
      </div>
    );

  },

  loadUnpublishedElementsFromServer() {
    Fetcher
      .get('/syntheses/'+ this.props.synthesis.id + '/elements/unpublished')
      .then((data) => {
        this.setState({
          'unpublishedElements': data
        });
      });
  }

});

export default ElementsUnpublished;
