import React from 'react';
import { IntlMixin } from 'react-intl';
import classNames from 'classnames';
import SynthesisElementActions from '../../actions/SynthesisElementActions';
import ElementTitle from './Element/ElementTitle';
import ElementIcon from './Element/ElementIcon';

const ElementsFinder = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
    type: React.PropTypes.string,
    selectedId: React.PropTypes.string,
    elements: React.PropTypes.array,
    expanded: React.PropTypes.object,
    onSelect: React.PropTypes.func,
    onExpand: React.PropTypes.func,
    hiddenElementId: React.PropTypes.string,
  },
  mixins: [IntlMixin],

  getDefaultProps() {
    return {
      selectedId: 'root',
      elements: {},
      expanded: {
        root: true,
      },
      onSelect: null,
      onExpand: null,
      type: 'notIgnored',
      hiddenElementId: null,
    };
  },

  getRootElement() {
    return [{
      id: 'root',
      title: this.getIntlMessage('synthesis.edition.finder.root'),
      displayType: 'root',
      children: this.props.elements,
    }];
  },

  toggleExpand(event, element) {
    event.stopPropagation();
    if (element.childrenCount !== element.children.length) {
      SynthesisElementActions.loadElementsTreeFromServer(this.props.synthesis.id, this.props.type, element.id);
    }
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

  renderTreeItems(elements, level, expanded = false) {
    if (expanded && elements) {
      return (
        <ul className={'tree__list tree--level-' + level}>
          {
            elements.map((element) => {
              const classes = classNames({
                'tree__item': true,
                'published': element.published,
              });
              if (!this.props.hiddenElementId || element.id !== this.props.hiddenElementId) {
                return (
                  <li key={element.id} className={classes} >
                    {this.renderTreeItemContent(element)}
                    {this.renderTreeItems(element.children, level + 1, this.props.expanded[element.id])}
                  </li>
                );
              }
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
      <div id={'element-' + element.id} className={classes} onClick={() => this.select(element)}>
        {this.renderItemCaret(element)}
        {element.id === 'root'
          ? <ElementIcon className="tree__item__icon" element={element} />
          : null
        }
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
    if (element.childrenCount > 0) {
      return (
        <i className={classes} onClick={(ev) => this.toggleExpand(ev, element)}></i>
      );
    }
  },

  renderItemTitle(element) {
    return (
      <ElementTitle element={element} className="tree__item__title" hasLink={false} />
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

});

export default ElementsFinder;
