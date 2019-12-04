import React from 'react';
import ElementTitle from './ElementTitle';

type Props = {
  element: Object,
  link: string,
};

class ElementBreadcrumb extends React.Component<Props> {
  static defaultProps = {
    link: 'edition',
  };

  getElementBreadcrumbItems = element => {
    const items = [];
    if (element.path) {
      element.path.split('|').map(data => {
        const splitted = data.split('-');
        const title = splitted.slice(0, splitted.length - 5).join('-');
        const id = splitted.slice(splitted.length - 5, splitted.length).join('-');
        const item = {
          title: title || null,
          id,
        };
        items.push(item);
      });
      return items;
    }
    items.push({
      id: null,
      title: '(...)',
    });
    if (element.parent) {
      items.push(element.parent);
    }
    items.push(element);
    return items;
  };

  renderBreadCrumbItem = (element, index) => {
    const { link } = this.props;
    return (
      <span key={index} className="element__breadcrumb-item">
        <span className="element__breadcrumb-arrow"> > </span>
        <ElementTitle element={element} link={link} />
      </span>
    );
  };

  render() {
    const { element } = this.props;
    const items = this.getElementBreadcrumbItems(element);
    return (
      <p className="element__breadcrumb">
        <i className="cap cap-folder-2" />
        {items.map((item, index) => {
          return this.renderBreadCrumbItem(item, index);
        })}
      </p>
    );
  }
}

export default ElementBreadcrumb;
