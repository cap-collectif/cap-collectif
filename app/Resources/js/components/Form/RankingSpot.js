import React, { PropTypes } from 'react';
import { DropTarget } from 'react-dnd';
import { ITEM_TYPE } from '../../constants/RankingConstants';

const spotTarget = {
  drop(props, monitor) {
    props.onDrop(monitor.getItem());
  },
};

const RankingSpot = React.createClass({
  displayName: 'RankingSpot',

  propTypes: {
    connectDropTarget: PropTypes.func.isRequired,
    isOver: PropTypes.bool.isRequired,
    onDrop: PropTypes.func.isRequired,
    canDrop: PropTypes.bool.isRequired,
    children: PropTypes.element,
  },

  render() {
    const { connectDropTarget, isOver, canDrop, children } = this.props;
    const color = isOver && canDrop ? '#eee' : 'transparent';
    return connectDropTarget(
      <div className="ranking__spot" style={{ backgroundColor: color }}>
        {children}
      </div>,
    );
  },
});

export default DropTarget(ITEM_TYPE, spotTarget, (connect, monitor) => ({
  // eslint-disable-line new-cap
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
}))(RankingSpot);
