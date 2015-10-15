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
    element.path.split('|').map((data) => {
      const splitted = data.split('-');
      const title = splitted.shift();
      const id = splitted.join('-');
      const item = {
        'title': title ? title : null,
        'id': id,
      };
      items.push(item);
    });
    return items;
  },

  renderLinkOrSpan(element) {
    if (this.props.link) {
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
