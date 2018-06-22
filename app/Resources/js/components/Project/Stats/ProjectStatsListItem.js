// @flow
import React from 'react';
import { FormattedNumber } from 'react-intl';
import { ListGroupItem } from 'react-bootstrap';

type Props = {
  item: Object,
  showPercentage: boolean,
  isCurrency: boolean,
};

class ProjectStatsListItem extends React.Component<Props> {
  getFormattedValue = () => {
    const { isCurrency, item, showPercentage } = this.props;
    if (showPercentage) {
      return `${item.percentage}%`;
    }

    if (isCurrency) {
      return (
        <FormattedNumber
          minimumFractionDigits={0}
          value={item.value || 0}
          style="currency"
          currency="EUR"
        />
      );
    }
    return item.value;
  };

  render() {
    const { item } = this.props;
    return (
      <ListGroupItem className="stats__list__row">
        <span className="stats__list__bar" style={{ width: `${item.percentage}%` }} />
        <div className="stats__list__value">
          <span className="badge badge-primary pull-right">{this.getFormattedValue()}</span>
          {item.name}
        </div>
      </ListGroupItem>
    );
  }
}

export default ProjectStatsListItem;
