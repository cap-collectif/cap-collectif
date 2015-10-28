import ViewTree from './ViewTree';

const Preview = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <div className="synthesis__view">
        <ViewTree synthesis={this.props.synthesis} />
      </div>
    );
  },

});

export default Preview;
