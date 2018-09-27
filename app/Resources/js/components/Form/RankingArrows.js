// @flow
import React from 'react';
import { ButtonGroup } from 'react-bootstrap';
import RankingArrow from './RankingArrow';

type Props = {
  item: Object,
  arrowFunctions?: { [key: string]: Function },
  disabled?: boolean,
};

class RankingArrows extends React.Component<Props> {
  static displayName = 'RankingArrows';

  static defaultProps = {
    disabled: false,
  };

  render() {
    const { item, arrowFunctions, disabled } = this.props;
    return (
      <ButtonGroup className="ranking__item__arrows">
        {arrowFunctions &&
          Object.keys(arrowFunctions).map(key => (
            <RankingArrow
              key={key}
              onClick={
                arrowFunctions && arrowFunctions[key] ? () => arrowFunctions[key](item) : () => {}
              }
              type={key}
              disabled={disabled || (arrowFunctions && !arrowFunctions[key])}
            />
          ))}
      </ButtonGroup>
    );
  }
}

export default RankingArrows;
