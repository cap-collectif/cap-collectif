import ViewElement from './ViewElement';
import Loader from '../Utils/Loader';

import SynthesisStore from '../../stores/SynthesisStore';
import SynthesisElementStore from '../../stores/SynthesisElementStore';
import SynthesisElementActions from '../../actions/SynthesisElementActions';

import SynthesisDisplayRules from '../../services/SynthesisDisplayRules';

const ViewTree = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      settings: [],
      elements: [],
      expanded: [],
      isLoading: true,
    };
  },

  componentWillMount() {
    SynthesisElementStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    this.fetchSettings();
    this.fetchElements();
  },

  componentWillUnmount() {
    SynthesisElementStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.fetchElements();
  },

  toggleExpand(element) {
    if (element.childrenCount !== element.children.length) {
      SynthesisElementActions.loadElementsTreeFromServer(this.props.synthesis.id, 'published', element.id);
    }
    SynthesisElementActions.expandTreeItem('view', element.id, !this.state.expanded[element.id]);
  },

  fetchSettings() {
    this.setState({
      settings: SynthesisStore.settings,
    });
    return;
  },

  fetchElements() {
    if (!SynthesisElementStore.isFetchingTree) {
      if (SynthesisElementStore.isInboxSync.publishedTree) {
        this.setState({
          elements: SynthesisElementStore.elements.publishedTree,
          expanded: SynthesisElementStore.expandedItems.view,
          isLoading: false,
        });
        return;
      }

      this.setState({
        isLoading: true,
      }, () => {
        this.loadElementsTreeFromServer();
      });
    }
  },

  loadElementsTreeFromServer() {
    SynthesisElementActions.loadElementsTreeFromServer(
      this.props.synthesis.id,
      'published'
    );
  },

  renderTreeItems(elements, parent = null, expanded = false) {
    if (expanded && elements) {
      return (
        <ul className="synthesis__elements">
          {
            elements.map((element) => {
              return (
                <li>
                  <ViewElement
                    key={element.id}
                    element={element}
                    parent={parent}
                    settings={SynthesisDisplayRules.getMatchingSettingsForElement(element, this.state.settings)}
                    expanded ={!!this.state.expanded[element.id]}
                    onToggleExpand={this.toggleExpand}
                  />
                  {this.renderTreeItems(element.children, element, this.state.expanded[element.id])}
                </li>
              );
            })
          }
        </ul>
      );
    }
  },

  render() {
    if (this.state.elements.length > 0) {
      return this.renderTreeItems(this.state.elements, null, true);
    }
    return <Loader show={this.state.isLoading}/>;
  },

});

export default ViewTree;
