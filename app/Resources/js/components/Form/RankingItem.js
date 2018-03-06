import React, { PropTypes } from 'react';
import { DragSource } from 'react-dnd';
import classNames from 'classnames';
import { ITEM_TYPE } from '../../constants/RankingConstants';
import RankingArrows from './RankingArrows';

const itemSource = {
  beginDrag(props) {
    return {
      id: props.item.id
    };
  },

  canDrag(props) {
    return !props.disabled;
  }
};

const RankingItem = React.createClass({
  displayName: 'RankingItem',
  propTypes: {
    id: PropTypes.string.isRequired,
    item: PropTypes.object.isRequired,
    position: PropTypes.number,
    connectDragSource: PropTypes.func.isRequired,
    isDragging: PropTypes.bool.isRequired,
    arrowFunctions: PropTypes.object,
    disabled: PropTypes.bool.isRequired
  },

  getDefaultProps() {
    return {
      position: null
    };
  },

  render() {
    const {
      id,
      item,
      position,
      isDragging,
      connectDragSource,
      arrowFunctions,
      disabled
    } = this.props;
    const opacity = isDragging ? 0.5 : 1;
    const classes = classNames({
      ranking__item: true,
      'list-group-item': true,
      disabled
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
          <p className="excerpt small ranking__item__description">{item.description}</p>
        )}
        {item.image && (
          <div>
            <img className="ranking__item__image" alt="" src={item.image.url} />
          </div>
        )}
        <RankingArrows item={item} arrowFunctions={arrowFunctions} disabled={disabled} />
      </div>
    );
  }
});

export default DragSource(ITEM_TYPE, itemSource, (connect, monitor) => ({
  // eslint-disable-line new-cap
  connectDragSource: connect.dragSource(),
  isDragging: monitor.isDragging()
}))(RankingItem);
