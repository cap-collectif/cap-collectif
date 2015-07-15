import NotationButtons from './NotationButtons';
import DisableButtons from './DisableButtons';
import MoveButtons from './MoveButtons';
import ArchiveButtons from './ArchiveButtons';

const ElementButtons = React.createClass({
  propTypes: {
    element: React.PropTypes.object,
  },
  mixins: [ReactIntl.IntlMixin],

  render() {
    return (
      <div className="element__actions box text-center">
        <NotationButtons {...this.props} />
        <DisableButtons {...this.props} />
        <MoveButtons {...this.props} />
        <ArchiveButtons {...this.props} />
      </div>
    );
  },

});

export default ElementButtons;
