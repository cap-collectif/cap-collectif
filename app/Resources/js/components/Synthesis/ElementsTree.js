import ElementTitle from './ElementTitle';
import Fetcher from '../../services/Fetcher';

var FormattedMessage  = ReactIntl.FormattedMessage;

var ElementTree = React.createClass({
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      rootElements: []
    };
  },

  componentDidMount() {
    this.loadPublishedRootElementsFromServer();
  },

  render() {
    return (
      <div className="synthesis__elements-tree">
        {this.renderTreeItems(this.state.rootElements, 0)}
      </div>
    );
  },

  renderTreeItems(elements, level) {
    return (
      <ul className={"elements-tree__list tree-level-" + level}>
        {
          elements.map((element) => {
            return (
              <li className="elements-tree__item">
                {this.renderTreeItemContent(element)}
                {this.renderTreeItems(element.children, level+1)}
              </li>
            );
          })
        }
      </ul>
    );
  },

  renderTreeItemContent(element) {
    return (
      <div className="elements-tree__item-content box">
        {this.renderItemIcon(element)}
        {this.renderItemBody(element)}
      </div>
    );
  },

  renderItemIcon(element) {
    console.log(element);
    if (element.display_type === 'contribution') {
      return <i className="elements-tree__item-icon cap cap-baloon-1"></i>;
    }
    return <i className="elements-tree__item-icon cap cap-folder-2"></i>;
  },

  renderItemBody(element) {
    return (
      <p className="elements-tree__item-body">
        <span><ElementTitle element={element} /></span>
        <br/>
        <span className="small excerpt">
          <FormattedMessage
            message={this.getIntlMessage('common.elements.nb')}
            num={element.children.length}
          />
        </span>
      </p>
    );
  },

  loadPublishedRootElementsFromServer() {
    Fetcher
      .get('/syntheses/'+ this.props.synthesis.id + '/elements/root')
      .then((data) => {
        this.setState({
          rootElements: data
        });
      });
  }

});

export default ElementTree;
