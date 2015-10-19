import ElementTitle from './ElementTitle';
const Link = ReactRouter.Link;

const ElementBreadcrumb = React.createClass({
  propTypes: {
    element: React.PropTypes.object,
    link: React.PropTypes.bool,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      link: true,
    };
  },

  getElementBreadcrumbItems(element) {
    const items = [];
    if (element.path) {
      element.path.split('|').map((data) => {
        const splitted = data.split('-');
        const title = splitted.shift();
        const id = splitted.join('-');
        const item = {
          'title': title || null,
          'id': id,
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
  },

  renderLinkOrSpan(element) {
    if (this.props.link && element.id) {
      return (
        <Link to={'/element/' + element.id} >
          <ElementTitle element={element} />
        </Link>
      );
    }
    return (
        <ElementTitle element={element} />
    );
  },

  renderBreadCrumbItem(element) {
    return (
      <span key={element.id} className="element__breadcrumb-item">
        <span className="element__breadcrumb-arrow"> > </span>
        {this.renderLinkOrSpan(element)}
      </span>
    );
  },

  render() {
    const items = this.getElementBreadcrumbItems(this.props.element);
    return (
      <p className="element__breadcrumb">
        <i className="cap cap-folder-2"></i>
        {
          items.map((element) => {
            return this.renderBreadCrumbItem(element);
          })
          }
      </p>
    );
  },


});

export default ElementBreadcrumb;
