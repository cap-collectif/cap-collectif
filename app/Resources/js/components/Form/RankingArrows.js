import React, { PropTypes } from 'react';
import { ButtonGroup } from 'react-bootstrap';
import RankingArrow from './RankingArrow';

const RankingArrows = React.createClass({
  displayName: 'RankingArrows',
  propTypes: {
    item: PropTypes.object.isRequired,
    arrowFunctions: PropTypes.shape({
      left: PropTypes.func,
      right: PropTypes.func,
      up: PropTypes.func,
      down: PropTypes.func,
    }),
    disabled: PropTypes.bool,
  },

  getDefaultProps() {
    return {
      disabled: false,
    };
  },

  render() {
    const { item, arrowFunctions, disabled } = this.props;
    return (
      <ButtonGroup className="ranking__item__arrows">
        {Object.keys(arrowFunctions).map(key => {
          return (
            <RankingArrow
              key={key}
              onClick={arrowFunctions[key] ? () => arrowFunctions[key](item) : null}
              type={key}
              disabled={disabled || !arrowFunctions[key]}
            />
          );
        })}
      </ButtonGroup>
    );
  },
});

export default RankingArrows;
