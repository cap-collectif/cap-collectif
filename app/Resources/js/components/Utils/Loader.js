const Loader = React.createClass({
  propTypes: {
    show: React.PropTypes.bool,
  },
  mixins: [ReactIntl.IntlMixin],

  getDefaultProps() {
    return {
      show: false,
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
    return null;
  },

});

export default Loader;
