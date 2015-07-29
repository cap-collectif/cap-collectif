const ElementIcon = React.createClass({
  propTypes: {
    element: React.PropTypes.object,
    classes: React.PropTypes.string,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    if (this.props.element.display_type) {
      const classes = classNames({
        'cap': true,
        'cap-baloon-1': this.props.element.display_type === 'contribution',
        'cap-folder-2': this.props.element.display_type === 'folder',
      }) + ' ' + this.props.classes;
      return (
        <i className={classes}></i>
      );
    }
    return (
      <span></span>
    );
  },

});

export default ElementIcon;
