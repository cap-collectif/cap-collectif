import React, { PropTypes } from 'react';
import RankingArrow from './RankingArrow';
import { ButtonGroup } from 'react-bootstrap';

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
        {
          Object.keys(arrowFunctions).filter(key => arrowFunctions[key] !== null).map((key) => {
            return (
              <RankingArrow
                key={key}
                onClick={() => arrowFunctions[key](item)}
                type={key}
                disabled={disabled}
              />
            );
          })
        }
      </ButtonGroup>
    );
  },

});

export default RankingArrows;
