import React from 'react';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames';
import SynthesisElementActions from '../../actions/SynthesisElementActions';
import ElementTitle from './Element/ElementTitle';
import ElementIcon from './Element/ElementIcon';

type Props = {
  synthesis: Object,
  type: string,
  selectedId: string,
  elements: Array<Object>,
  expanded: Object,
  onSelect: Function,
  onExpand: Function,
  hiddenElementId: string,
};

class ElementsFinder extends React.Component<Props> {
  static defaultProps = {
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

  getRootElement = () => {
    const { elements } = this.props;
    return [
      {
        id: 'root',
        title: <FormattedMessage id='global.synthesis' />,
        displayType: 'root',
        children: elements,
      },
    ];
  };

  toggleExpand = (event, element) => {
    const { onExpand, synthesis, type } = this.props;
    event.stopPropagation();
    if (element.childrenCount !== element.children.length) {
      SynthesisElementActions.loadElementsTreeFromServer(synthesis.id, type, element.id);
    }
    if (typeof onExpand === 'function') {
      onExpand(element);
    }
    return false;
  };

  select = element => {
    const { onSelect } = this.props;
    if (typeof onSelect === 'function') {
      onSelect(element);
    }
  };

  renderTreeItems = (elements, level, expand = false, parent = null) => {
    const { expanded, hiddenElementId } = this.props;
    if (expand && elements) {
      return (
        <ul className={`tree__list tree--level-${level}`}>
          {elements.map(element => {
            const classes = classNames({
              tree__item: true,
              published: element.published,
            });
            if (!hiddenElementId || element.id !== hiddenElementId) {
              return (
                <li key={element.id} className={classes}>
                  {this.renderTreeItemContent(element, parent)}
                  {this.renderTreeItems(element.children, level + 1, expanded[element.id], element)}
                </li>
              );
            }
          })}
        </ul>
      );
    }
  };

  renderTreeItemContent = (element, parent = null) => {
    const { selectedId } = this.props;
    const classes = classNames({
      tree__item__content: true,
      selected: selectedId === element.id,
    });
    return (
      <div id={`element-${element.id}`} className={classes} onClick={() => this.select(element)}>
        {this.renderItemCaret(element)}
        {element.id === 'root' ? (
          <ElementIcon className="tree__item__icon" element={element} />
        ) : null}
        <ElementTitle
          element={element}
          parent={parent}
          className="tree__item__title"
          hasLink={false}
        />
      </div>
    );
  };

  renderItemCaret = element => {
    const { expanded } = this.props;
    const classes = classNames({
      tree__item__caret: true,
      'cap-arrow-67': expanded[element.id],
      'cap-arrow-66': !expanded[element.id],
    });
    if (element.childrenCount > 0) {
      return <i className={classes} onClick={ev => this.toggleExpand(ev, element)} />;
    }
  };

  renderTree = () => {
    return this.renderTreeItems(this.getRootElement(), 0, true);
  };

  render() {
    return <div className="synthesis__tree">{this.renderTree()}</div>;
  }
}

export default ElementsFinder;
