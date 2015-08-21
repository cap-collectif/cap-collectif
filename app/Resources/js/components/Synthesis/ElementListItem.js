import ElementBlock from './ElementBlock';

const ElementListItem = React.createClass({
  propTypes: {
    element: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    const classes = classNames({
      'synthesis__list-item': true,
      'box': true,
      'archived': this.props.element.archived,
    });
    return (
      <li className={classes}>
        <ElementBlock element={this.props.element} />
      </li>
    );
  },

});

export default ElementListItem;
