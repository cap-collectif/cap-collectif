import React from 'react';
import {IntlMixin, FormattedNumber} from 'react-intl';
import {ListGroupItem} from 'react-bootstrap';

const ProjectStatsListItem = React.createClass({
  propTypes: {
    item: React.PropTypes.object.isRequired,
    showPercentage: React.PropTypes.bool.isRequired,
    isCurrency: React.PropTypes.bool.isRequired,
  },
  mixins: [IntlMixin],

  getFormattedValue() {
    if (this.props.showPercentage) {
      return this.props.item.percentage + '%';
    }

    if (this.props.isCurrency) {
      return <FormattedNumber value={this.props.item.value || 0} style="currency" currency="EUR"/>;
    }
    return this.props.item.value;
  },

  render() {
    const {item} = this.props;
    return (
      <ListGroupItem className="stats__list__row">
        <span className="stats__list__bar" style={{width: item.percentage + '%'}} />
        <div className="stats__list__value">
          <span className="badge pull-right">
            {this.getFormattedValue()}
          </span>
          {item.name}
        </div>
      </ListGroupItem>
    );
  },

});

export default ProjectStatsListItem;
