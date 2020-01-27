// @flow
import React from 'react';
import { DropTarget } from 'react-dnd';
import { ITEM_TYPE } from '../../constants/RankingConstants';

const spotTarget = {
  drop(props, monitor) {
    props.onDrop(monitor.getItem());
  },
};

type Props = {
  connectDropTarget: Function,
  isOver: boolean,
  onDrop: Function,
  canDrop: boolean,
  children?: $FlowFixMe,
};

class RankingSpot extends React.Component<Props> {
  static displayName = 'RankingSpot';

  render() {
    const { connectDropTarget, isOver, canDrop, children } = this.props;
    const color = isOver && canDrop ? '#eee' : 'transparent';
    return connectDropTarget(
      <div className="ranking__spot" style={{ backgroundColor: color }}>
        {children}
      </div>,
    );
  }
}

export default DropTarget(ITEM_TYPE, spotTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
}))(RankingSpot);
