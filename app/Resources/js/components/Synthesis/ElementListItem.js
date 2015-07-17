import ElementBlock from './ElementBlock';

var ElementListItem = React.createClass({
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <li className="element box">
        <ElementBlock element={this.props.element} />
      </li>
    )
  }

});

export default ElementListItem;
