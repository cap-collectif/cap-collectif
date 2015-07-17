import ElementListItem from './ElementListItem';

const ElementsList = React.createClass({
  propTypes: {
    elements: React.PropTypes.array,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <ul className="media-list synthesis__elements-list">
        {
          this.props.elements.map((element) => {
            return <ElementListItem key={element.id} element={element} />;
          })
        }
      </ul>
    );
  },

});

export default ElementsList;
