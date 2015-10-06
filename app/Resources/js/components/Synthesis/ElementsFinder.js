import SynthesisElementStore from '../../stores/SynthesisElementStore';
import SynthesisElementActions from '../../actions/SynthesisElementActions';
import ElementTitle from './ElementTitle';
import ElementIcon from './ElementIcon';
import Loader from '../Utils/Loader';

const ElementsFinder = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
    selectedId: React.PropTypes.string,
    onSelect: React.PropTypes.func,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      elements: [],
      selectedId: this.props.selectedId,
      expanded: this.getExpandedBasedOnSelectedId(),
      isLoading: true,
    };
  },

  componentWillMount() {
    SynthesisElementStore.addChangeListener(this.onChange);
  },

  componentDidMount() {
    this.fetchElementsTree();
  },

  componentWillUnmount() {
    SynthesisElementStore.removeChangeListener(this.onChange);
  },

  onChange() {
    this.fetchElementsTree();
  },

  getExpandedBasedOnSelectedId() {
    const expanded = {
      root: true,
    };
    if (this.state && this.state.elements && this.props.selectedId && this.props.selectedId !== 'root') {
      expanded[this.props.selectedId] = true;
      const element = this.getElementInTreeById(this.state.elements, this.props.selectedId);
      if (element) {
        element.parents_ids.map((id) => {
          expanded[id] = true;
        });
      }
    }
    return expanded;
  },

  getElementInTreeById(elements, id) {
    for (let i = 0; i < elements.length; i++) {
      const element = elements[i];
      if (element.id === id) {
        return element;
      }
      if (element.children.length > 0) {
        const found = this.getElementInTreeById(element.children, id);
        if (found) {
          return found;
        }
      }
    }
    return null;
  },

  getRootElement() {
    return [{
      id: 'root',
      title: this.getIntlMessage('edition.finder.root'),
      display_type: 'root',
      children: this.state.elements,
      parents_ids: [],
    }];
  },

  renderTreeItems(elements, level, expanded = false) {
    if (expanded && elements) {
      return (
        <ul className={'tree__list tree--level-' + level}>
          {
            elements.map((element) => {
              return (
                <li key={element.id} className="tree__item">
                  {this.renderTreeItemContent(element)}
                  {this.renderTreeItems(element.children, level + 1, this.state.expanded[element.id])}
                </li>
              );
            })
          }
        </ul>
      );
    }
  },

  renderTreeItemContent(element) {
    const classes = classNames({
      'tree__item__content': true,
      'selected': this.state.selectedId === element.id,
    });
    return (
      <div id={'element-' + element.id} className={classes} onClick={this.select.bind(this, element)}>
        {this.renderItemCaret(element)}
        <ElementIcon className="tree__item__icon" element={element} />
        {this.renderItemTitle(element)}
      </div>
    );
  },

  renderItemCaret(element) {
    const classes = classNames({
      'tree__item__caret': true,
      'cap-arrow-67': this.state.expanded[element.id],
      'cap-arrow-66': !this.state.expanded[element.id],
    });
    if (element.children.length > 0) {
      return (
        <i className={classes} onClick={this.toggleExpand.bind(this, element)}></i>
      );
    }
  },

  renderItemTitle(element) {
    return (
      <ElementTitle element={element} className="tree__item__title" link={false} />
    );
  },

  renderTree() {
    if (!this.state.isLoading) {
      return this.renderTreeItems(this.getRootElement(), 0, true);
    }
  },

  render() {
    return (
      <div className="synthesis__tree">
        <Loader show={this.state.isLoading} />
        {this.renderTree()}
      </div>
    );
  },

  toggleExpand(element) {
    const expanded = this.state.expanded;
    expanded[element.id] = this.state.expanded[element.id] ? false : true;
    this.setState({
      expanded: expanded,
    });
  },

  select(element) {
    this.setState({
      selectedId: element.id,
    });
    if (typeof this.props.onSelect === 'function') {
      this.props.onSelect(element);
    }
  },

  fetchElementsTree() {
    if (!SynthesisElementStore.isProcessing && SynthesisElementStore.isInboxSync.allTree) {
      this.setState({
        elements: SynthesisElementStore.elements.allTree,
        expanded: this.getExpandedBasedOnSelectedId(),
        isLoading: false,
      });
      return;
    }

    this.setState({
      isLoading: true,
    }, () => {
      this.loadElementsTreeFromServer();
    });
  },

  loadElementsTreeFromServer() {
    SynthesisElementActions.loadElementsTreeFromServer(
      this.props.synthesis.id,
      'all'
    );
  },

});

export default ElementsFinder;
