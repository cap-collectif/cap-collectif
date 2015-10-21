import ElementListItem from './ElementListItem';

const Nav = ReactBootstrap.Nav;

const ElementsList = React.createClass({
  propTypes: {
    elements: React.PropTypes.array.isRequired,
    showBreadcrumb: React.PropTypes.bool,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return ({
      showBreadcrumb: true,
    });
  },

  render() {
    if (this.props.elements.length < 1) {
      return null;
    }

    return (
      <Nav stacked className="synthesis__list">
        {
          this.props.elements.map((element) => {
            return <ElementListItem key={element.id} element={element} showBreadcrumb={this.props.showBreadcrumb} />;
          })
        }
      </Nav>
    );
  },

});

export default ElementsList;
