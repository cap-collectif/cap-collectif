import ElementTitle from './ElementTitle';
import ElementIcon from './ElementIcon';

const ElementsFinder = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
    selectedId: React.PropTypes.string,
    elements: React.PropTypes.array,
    expanded: React.PropTypes.object,
    onSelect: React.PropTypes.func,
    onExpand: React.PropTypes.func,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      selectedId: 'root',
      elements: {},
      expanded: {
        root: true,
      },
      onSelect: null,
      onExpand: null,
    };
  },

  getRootElement() {
    return [{
      id: 'root',
      title: this.getIntlMessage('edition.finder.root'),
      display_type: 'root',
      children: this.props.elements,
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
                  {this.renderTreeItems(element.children, level + 1, this.props.expanded[element.id])}
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
      'selected': this.props.selectedId === element.id,
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
      'cap-arrow-67': this.props.expanded[element.id],
      'cap-arrow-66': !this.props.expanded[element.id],
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
    return this.renderTreeItems(this.getRootElement(), 0, true);
  },

  render() {
    return (
      <div className="synthesis__tree">
        {this.renderTree()}
      </div>
    );
  },

  toggleExpand(element) {
    event.stopPropagation();
    if (typeof this.props.onExpand === 'function') {
      this.props.onExpand(element);
    }
    return false;
  },

  select(element) {
    if (typeof this.props.onSelect === 'function') {
      this.props.onSelect(element);
    }
  },

});

export default ElementsFinder;
