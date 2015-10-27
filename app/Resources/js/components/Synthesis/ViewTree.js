import ViewElement from './ViewElement';
import Loader from '../Utils/Loader';

import SynthesisStore from '../../stores/SynthesisStore';
import SynthesisElementStore from '../../stores/SynthesisElementStore';
import SynthesisElementActions from '../../actions/SynthesisElementActions';

import SynthesisDisplayRules from '../../services/SynthesisDisplayRules';

const FormattedMessage = ReactIntl.FormattedMessage;

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

  renderCaret(element) {
    if (SynthesisDisplayRules.getValueForRuleAndElement(element, this.state.settings, 'display', 'childrenInModal')) {
      return null;
    }
    const expanded = this.state.expanded[element.id] || false;
    if (element.publishedChildrenCount > 0 && element.childrenCount > 0) {
      const classes = classNames({
        'cap-arrow-67': expanded,
        'cap-arrow-66': !expanded,
        'pull-right': true,
      });
      return (
        <div className="synthesis__element__readmore" onClick={this.toggleExpand.bind(null, element)}>
          {
            expanded
            ? <span>
                <FormattedMessage
                  message={this.getIntlMessage('readmore.hide')}
                  title={element.title}
                />
              </span>
            : <span>
                <FormattedMessage
                  message={this.getIntlMessage('readmore.show')}
                  title={element.title}
                />
              </span>
          }
          <i style={{marginLeft: '5px'}} className={classes}></i>
        </div>
      );
    }
    return null;
  },

  renderTreeItems(elements, parent = null, expanded = false) {
    if (expanded && elements && !SynthesisDisplayRules.getValueForRuleAndElement(parent, this.state.settings, 'display', 'childrenInModal')) {
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
                  />
                  {this.renderTreeItems(element.children, element, this.state.expanded[element.id])}
                  {this.renderCaret(element)}
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
