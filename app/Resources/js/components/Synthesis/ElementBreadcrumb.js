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

  getElementBreadcrumbItems(element, parents = []) {
    if (element.parent) {
      parents.push(element.parent);
      return this.getElementBreadcrumbItems(element.parent, parents);
    }
    const items = parents.reverse();
    items.push(this.props.element);
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
      <p className="small excerpt element__breadcrumb">
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
