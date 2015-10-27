import ViewTree from './ViewTree';

const ViewBox = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    if (this.props.synthesis.enabled) {
      return (
        <div className="synthesis__view">
          <ViewTree synthesis={this.props.synthesis} />
        </div>
      );
    }
    return null;
  },

});

export default ViewBox;
