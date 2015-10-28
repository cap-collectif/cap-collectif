import ViewTree from './ViewTree';
import LoginStore from '../../stores/LoginStore';

const ViewBox = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object.isRequired,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    if (this.props.synthesis.enabled || (LoginStore.user && LoginStore.user.vip)) {
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
