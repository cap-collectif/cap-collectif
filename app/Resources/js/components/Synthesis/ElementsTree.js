import ElementTitle from './ElementTitle';
import SynthesisElementStore from '../../stores/SynthesisElementStore';
import SynthesisElementActions from '../../actions/SynthesisElementActions';

const FormattedMessage = ReactIntl.FormattedMessage;

const ElementTree = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      rootElements: [],
      isLoading: true,
    };
  },

  componentWillMount() {
    SynthesisElementStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    this.loadPublishedRootElementsFromServer();
  },

  componentWillUnmount() {
    SynthesisElementStore.removeChangeListener(this.onChange);
  },

  onChange() {
    if (SynthesisElementStore.isSync) {
      this.setState({
        rootElements: SynthesisElementStore.elements,
        isLoading: false,
      });
      return;
    }

    this.setState({
      isLoading: true,
    }, () => {
      this.loadPublishedRootElementsFromServer();
    });
  },

  renderTreeItems(elements, level) {
    if (elements) {
      return (
        <ul className={'elements-tree__list tree-level-' + level}>
          {
            elements.map((element) => {
              return (
                <li className="elements-tree__item">
                  {this.renderTreeItemContent(element)}
                  {this.renderTreeItems(element.children, level + 1)}
                </li>
              );
            })
            }
        </ul>
      );
    }
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
    if (element.display_type === 'contribution') {
      return <i className="elements-tree__item-icon cap cap-baloon-1"></i>;
    }
    return <i className="elements-tree__item-icon cap cap-folder-2"></i>;
  },

  renderItemBody(element) {
    return (
      <p className="elements-tree__item-body">
        <ElementTitle element={element} />
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
      <div className="synthesis__elements-tree">
        {this.renderLoader()}
        {this.renderTreeItems(this.state.rootElements, 0)}
      </div>
    );
  },

  loadPublishedRootElementsFromServer() {
    SynthesisElementActions.loadElementsTreeFromServer(
      this.props.synthesis.id
    );
  },

});

export default ElementTree;
