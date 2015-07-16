import ElementTitle from './ElementTitle';
const Link = ReactRouter.Link;

const ElementBreadcrumb = React.createClass({
  propTypes: {
    element: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  getElementBreadcrumbItems(element, parents = []) {
    if (element.parent) {
      parents.push(element.parent);
      return this.getElementBreadcrumbItems(element.parent, parents);
    }
    let items = parents.reverse()
    items.push(this.props.element);
    return items;
  },

  renderBreadCrumbItem(element) {
    return (
      <span className="element__breadcrumb-item">
        <span className="element__breadcrumb-arrow"> > </span>
        <Link to={'/element/' + element.id} >
          <ElementTitle element={element} />
        </Link>
      </span>
    );
  },

  render() {
    const items = this.getElementBreadcrumbItems(this.props.element);
    return (
      <p className="small  excerpt breadcrumb-item">
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
