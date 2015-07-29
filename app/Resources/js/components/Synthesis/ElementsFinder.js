import ElementTitle from './ElementTitle';

const ElementsFinder = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
    elements: React.PropTypes.array,
    selectedId: React.PropTypes.int,
    onSelect: React.PropTypes.func,
  },
  mixins: [ReactIntl.IntlMixin],

  getInitialState() {
    return {
      selectedId: this.props.selectedId,
      expanded: this.getExpandedBasedOnSelectedId(),
    };
  },

  getExpandedBasedOnSelectedId() {
    const expanded = {
      root: true,
    };
    if (this.props.selectedId && this.props.selectedId !== 'root') {
      expanded[this.props.selectedId] = true;
      const element = this.getElementInTreeById(this.props.elements, this.props.selectedId);
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
      display_type: 'folder',
      children: this.props.elements,
      parents_ids: [],
    }];
  },

  renderTreeItems(elements, level, expanded = false) {
    if (expanded && elements) {
      return (
        <ul className={'elements-tree__list tree-level-' + level}>
          {
            elements.map((element) => {
              return (
                <li className="elements-tree__item">
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
      'elements-tree__item-content': true,
      'selected': this.state.selectedId === element.id,
    });
    return (
      <div id={'element-' + element.id} className={classes} onClick={this.select.bind(this, element)}>
        {this.renderItemCaret(element)}
        {this.renderItemIcon(element)}
        {this.renderItemTitle(element)}
      </div>
    );
  },

  renderItemCaret(element) {
    const classes = classNames({
      'elements-tree__item-caret': true,
      'cap-arrow-67': this.state.expanded[element.id],
      'cap-arrow-66': !this.state.expanded[element.id],
    });
    if (element.children.length > 0) {
      return (
        <i className={classes} onClick={this.toggleExpand.bind(this, element)}></i>
      );
    }
  },

  renderItemIcon(element) {
    const classes = classNames({
      'elements-tree__item-icon': true,
      'cap': true,
      'cap-baloon-1': element.display_type === 'contribution',
      'cap-folder-2': element.display_type === 'folder',
    });
    return <i className={classes}></i>;
  },

  renderItemTitle(element) {
    return (
      <p className="elements-tree__item-body">
        <ElementTitle element={element} link={false} />
      </p>
    );
  },

  render() {
    return (
      <div className="elements__finder">
        {this.renderTreeItems(this.getRootElement(), 0, true)}
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

});

export default ElementsFinder;
