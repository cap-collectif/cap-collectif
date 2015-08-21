import ElementTitle from './ElementTitle';
import ElementIcon from './ElementIcon';
import Loader from '../Utils/Loader';
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
    if (!SynthesisElementStore.isProcessing && SynthesisElementStore.isInboxSync.publishedTree) {
      this.setState({
        rootElements: SynthesisElementStore.elements.publishedTree,
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
        <ul className={'tree__list tree--level-' + level}>
          {
            elements.map((element) => {
              return (
                <li className="tree__item">
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
      <div className="tree__item__content box">
        <ElementIcon className="tree__item__icon" element={element} />
        <ElementTitle element={element} className="tree__item__title" />
        <br/>
        <span className="small excerpt">
          <FormattedMessage
            message={this.getIntlMessage('common.elements.nb')}
            num={element.children.length}
            />
        </span>
      </div>
    );
  },

  render() {
    return (
      <div className="synthesis__tree">
        <Loader show={this.state.isLoading} />
        {this.renderTreeItems(this.state.rootElements, 0)}
      </div>
    );
  },

  loadPublishedRootElementsFromServer() {
    SynthesisElementActions.loadElementsTreeFromServer(
      this.props.synthesis.id,
      'published'
    );
  },

});

export default ElementTree;
