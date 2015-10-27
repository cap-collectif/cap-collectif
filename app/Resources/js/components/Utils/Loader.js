const Loader = React.createClass({
  propTypes: {
    show: React.PropTypes.bool,
    children: React.PropTypes.node,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      show: true,
      children: null,
    };
  },

  render() {
    if (this.props.show) {
      return (
        <div className="row">
          <div className="col-xs-2 col-xs-offset-5 spinner-loader-container">
            <div className="spinner-loader"></div>
          </div>
        </div>
      );
    }
    return this.props.children;
  },

});

export default Loader;
