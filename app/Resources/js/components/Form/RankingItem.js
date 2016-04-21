import React, { PropTypes } from 'react';
import { IntlMixin } from 'react-intl';
import { ItemTypes } from '../../constants/RankingConstants';
import { DragSource } from 'react-dnd';

const itemSource = {
  beginDrag(props) {
    return {};
  }
}

collect: (connect, monitor) => {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging(),
  }
}

const RankingItem = React.createClass({
  propTypes: {
    id: PropTypes.string.isRequired,
    choice: PropTypes.object.isRequired,
    connectDragSource: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
  },
  mixins: [IntlMixin],

  render() {
    const { id, choice, connectDragSource, isDragging } = this.props;
    return connectDragSource(
      <div className="ranking__item" id={id}>
        {choice.label}
      </div>
    );
  },

});

export default DragSource(ItemTypes.ITEM, itemSource, collect)(RankingItem);
