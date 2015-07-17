import ElementTitle from './ElementTitle';
let Link = ReactRouter.Link;

var ElementBreadcrumb = React.createClass({
  mixins: [ReactIntl.IntlMixin],

  render() {
    var items = this.getElementBreadcrumbItems(this.props.element);
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

  renderBreadCrumbItem(element) {
    return (
      <span className="element__breadcrumb-item">
        <span className="element__breadcrumb-arrow"> > </span>
        <Link to={"/element/" + element.id} >
          <ElementTitle element={element} />
        </Link>
      </span>
    );
  },

  getElementBreadcrumbItems(element, parents = []) {
    if (element.parent) {
      parents.push(element.parent);
      return this.getElementBreadcrumbItems(element.parent, parents);
    }
    parents = parents.reverse();
    parents.push(this.props.element);
    return parents;
  }


});

export default ElementBreadcrumb;
