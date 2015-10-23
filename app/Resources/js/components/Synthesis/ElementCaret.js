const ElementCaret = React.createClass({
  propTypes: {
    element: React.PropTypes.object.isRequired,
    expanded: React.PropTypes.bool.isRequired,
    onToggleExpand: React.PropTypes.func.isRequired,
    style: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      style: {},
    };
  },

  render() {
    const element = this.props.element;
    const classes = classNames({
      'tree__item__caret': true,
      'cap-arrow-67': this.props.expanded,
      'cap-arrow-66': !this.props.expanded,
    });
    if (element.childrenCount > 0) {
      return (
        <i style={this.props.style} className={classes} onClick={this.props.onToggleExpand.bind(null, element)}></i>
      );
    }
    return <span style={this.props.style} />;
  },

});

export default ElementCaret;
