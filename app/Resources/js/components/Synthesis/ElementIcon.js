const ElementIcon = React.createClass({
  propTypes: {
    element: React.PropTypes.object.isRequired,
    className: React.PropTypes.string,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return ({
      className: '',
    });
  },

  render() {
    if (this.props.element.displayType) {
      const classes = classNames({
        'cap': true,
        'cap-baloon': this.props.element.displayType === 'contribution',
        'cap-folder-2': this.props.element.displayType === 'folder',
        'cap-book-1': this.props.element.displayType === 'root',
      }) + ' ' + this.props.className;
      return (
        <i className={classes}></i>
      );
    }
    return null;
  },

});

export default ElementIcon;
