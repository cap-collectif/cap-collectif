// @flow
import React from 'react';
import { DragSource } from 'react-dnd';
import classNames from 'classnames';
import { ITEM_TYPE } from '../../constants/RankingConstants';
import RankingArrows from './RankingArrows';
import WYSIWYGRender from './WYSIWYGRender';

const itemSource = {
  beginDrag(props) {
    return {
      id: props.item.id,
    };
  },

  canDrag(props) {
    return !props.disabled;
  },
};

type Props = {
  id: string,
  item: Object,
  position?: number,
  connectDragSource: Function,
  isDragging: boolean,
  arrowFunctions?: Object,
  disabled: boolean,
};

class RankingItem extends React.Component<Props> {
  static displayName = 'RankingItem';

  static defaultProps = {
    position: null,
  };

  render() {
    const {
      id,
      item,
      position,
      isDragging,
      connectDragSource,
      arrowFunctions,
      disabled,
    } = this.props;
    const opacity = isDragging ? 0.5 : 1;
    const classes = classNames({
      ranking__item: true,
      'list-group-item': true,
      disabled,
    });
    return connectDragSource(
      <div className={classes} id={id} style={{ opacity }}>
        <div style={{ marginBottom: '5px' }}>
          <div className="ranking__item__label-block">
            <span className="ranking__item__icon hidden-xs">
              <i className="cap cap-cursor-move" />
            </span>
            <span className="ranking__item__label">
              {position ? `${position}. ` : null}
              {item.label}
            </span>
          </div>
        </div>
        {item.description && (
          <WYSIWYGRender
            className="excerpt small ranking__item__description"
            value={item.description}
          />
        )}
        {item.image && (
          <div>
            <img className="ranking__item__image" alt="" src={item.image.url} />
          </div>
        )}
        <RankingArrows item={item} arrowFunctions={arrowFunctions} disabled={disabled} />
      </div>,
    );
  }
}

export default DragSource(ITEM_TYPE, itemSource, (connect, monitor) => ({
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging(),
}))(RankingItem);
