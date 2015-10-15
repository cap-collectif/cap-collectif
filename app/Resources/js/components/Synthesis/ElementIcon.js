const ElementIcon = React.createClass({
  propTypes: {
    element: React.PropTypes.object,
    className: React.PropTypes.string,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    if (this.props.element.display_type) {
      const classes = classNames({
        'cap': true,
        'cap-baloon': this.props.element.display_type === 'contribution',
        'cap-folder-2': this.props.element.display_type === 'folder',
        'cap-book-1': this.props.element.display_type === 'root',
      }) + ' ' + this.props.className;
      return (
        <i className={classes}></i>
      );
    }
    return null;
  },

});

export default ElementIcon;
