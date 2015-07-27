import PublishButton from './PublishButton';
import DivideButton from './DivideButton';
import IgnoreButton from './IgnoreButton';

const ElementButtons = React.createClass({
  propTypes: {
    synthesis: React.PropTypes.object,
    element: React.PropTypes.object,
    onModal: React.PropTypes.func,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <div className="element__actions box text-center">
        <PublishButton {...this.props} onModal={this.props.onModal} />
        <DivideButton {...this.props} />
        <IgnoreButton {...this.props} />
      </div>
    );
  },

});

export default ElementButtons;
