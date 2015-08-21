import ElementListItem from './ElementListItem';

const Nav = ReactBootstrap.Nav;

const ElementsList = React.createClass({
  propTypes: {
    elements: React.PropTypes.array,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <Nav stacked className="synthesis__list">
        {
          this.props.elements.map((element) => {
            return <ElementListItem key={element.id} element={element} />;
          })
        }
      </Nav>
    );
  },

});

export default ElementsList;
