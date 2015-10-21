import ElementBlock from './ElementBlock';

const ElementListItem = React.createClass({
  propTypes: {
    element: React.PropTypes.object.isRequired,
    showBreadcrumb: React.PropTypes.bool,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return ({
      showBreadcrumb: true,
    });
  },

  render() {
    const classes = classNames({
      'synthesis__list-item': true,
      'box': true,
      'archived': this.props.element.archived,
    });
    return (
      <li className={classes}>
        <ElementBlock element={this.props.element} showBreadcrumb={this.props.showBreadcrumb} />
      </li>
    );
  },

});

export default ElementListItem;
