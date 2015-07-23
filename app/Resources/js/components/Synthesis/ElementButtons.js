import PublishButton from './PublishButton';
import DivideButton from './DivideButton';
import IgnoreButton from './IgnoreButton';

const ElementButtons = React.createClass({
  propTypes: {
    element: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <div className="element__actions box text-center">
        <PublishButton {...this.props} />
        <DivideButton {...this.props} />
        <IgnoreButton {...this.props} />
      </div>
    );
  },

});

export default ElementButtons;
