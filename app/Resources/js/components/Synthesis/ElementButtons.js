import NotationButtons from './NotationButtons';
import DisableButtons from './DisableButtons';
import MoveButtons from './MoveButtons';
import ArchiveButtons from './ArchiveButtons';

var ElementButtons = React.createClass({
  mixins: [ReactIntl.IntlMixin],

  render() {
    var element = this.props.element;
    return (
      <div className="element__actions box text-center">
        <NotationButtons {...this.props} />
        <DisableButtons {...this.props} />
        <MoveButtons {...this.props} />
        <ArchiveButtons {...this.props} />
      </div>
    );
  }

});

export default ElementButtons;
