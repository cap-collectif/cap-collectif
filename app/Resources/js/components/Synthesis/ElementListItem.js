import ElementBlock from './ElementBlock';

const ElementListItem = React.createClass({
  propTypes: {
    element: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <li className="element box">
        <ElementBlock element={this.props.element} />
      </li>
    );
  },

});

export default ElementListItem;
